import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  generateFileUploadUrlsMutation,
  createFilesMutation,
} from "@/client/@tanstack/react-query.gen";
import { uploadFilesToS3, type UploadProgress } from "@/lib/upload";
import {
  type DilapsFileSet,
  type DilapsSubStatus,
  buildFileList,
  createDilapsRun,
  readDilapsRun,
} from "@/lib/dilaps-api";

export type { DilapsSubStatus } from "@/lib/dilaps-api";

export type DilapsStatus =
  | "idle"
  | "presigning"
  | "uploading"
  | "generating"
  | "completed"
  | "error";

type StartArgs = DilapsFileSet & {
  propertyAddress: string;
  jobId?: number;
  orgId: number;
};

const POLL_INTERVAL_MS = 2000;

function useUploadPipeline() {
  const presignMutation = useMutation({
    ...generateFileUploadUrlsMutation(),
  });

  const registerFilesMutation = useMutation({
    ...createFilesMutation(),
  });

  return { presignMutation, registerFilesMutation };
}

export function useDilapsGeneration() {
  const [dilapsId, setDilapsId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percent: 0,
    completedFiles: 0,
    totalFiles: 0,
  });
  const [localStatus, setLocalStatus] = useState<DilapsStatus>("idle");
  const [subStatus, setSubStatus] = useState<DilapsSubStatus>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { presignMutation, registerFilesMutation } = useUploadPipeline();

  const presignAndUpload = async (args: StartArgs) => {
    const allFiles = buildFileList(args);
    if (!allFiles.length) throw new Error("No files to upload");

    setLocalStatus("presigning");
    setUploadProgress({ percent: 0, completedFiles: 0, totalFiles: allFiles.length });

    const presignData = await presignMutation.mutateAsync({
      body: allFiles.map(({ file, clientId }) => ({
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        client_id: clientId,
      })),
    });

    if (!presignData) throw new Error("Failed to get presigned URLs");

    const fileMap = new Map(allFiles.map((f) => [f.clientId, f.file]));
    const uploads = presignData.map((p) => ({
      file: fileMap.get(p.client_id!)!,
      ...p,
    }));

    setLocalStatus("uploading");
    await uploadFilesToS3({
      files: uploads.map((u) => u.file),
      presignedPuts: uploads.map((u) => ({
        put_url: u.put_url,
        mime_type: u.mime_type,
        already_exists: u.already_exists ?? false,
      })),
      onProgress: setUploadProgress,
    });

    return { uploads, orgId: args.orgId };
  };

  const registerAndStart = async (args: StartArgs) => {
    const { uploads, orgId } = await presignAndUpload(args);

    const registered = await registerFilesMutation.mutateAsync({
      body: uploads.map((u) => ({
        file_name: u.file.name,
        mime_type: u.file.type || "application/octet-stream",
        size_bytes: u.file.size,
        storage_key: u.storage_key,
        org_id: orgId,
      })),
    });

    if (!registered?.length) throw new Error("No files registered");

    const templateFileId = registered[0]!.id;
    const contextFileIds = registered.slice(1).map((f) => f.id);

    const run = await createDilapsRun({
      property_address: args.propertyAddress,
      job_id: args.jobId,
      template_file_id: templateFileId,
      context_file_ids: contextFileIds,
    });

    return run.id;
  };

  const startGeneration = async (args: StartArgs) => {
    if (!args.leaseFile) throw new Error("Lease PDF is required");
    return registerAndStart(args);
  };

  const mutation = useMutation({
    mutationFn: startGeneration,
    onSuccess: (id) => {
      setDilapsId(id);
      setLocalStatus("generating");
      setSubStatus("embedding");
    },
    onError: (error) => {
      setLocalStatus("error");
      setErrorMessage(error.message);
    },
  });

  const { data: dilapsRun } = useQuery({
    queryKey: ["dilaps", dilapsId],
    queryFn: () => readDilapsRun(dilapsId!),
    enabled: !!dilapsId && localStatus === "generating",
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "error") return false;
      return POLL_INTERVAL_MS;
    },
  });

  useEffect(() => {
    if (!dilapsRun?.status || localStatus !== "generating") return;

    if (dilapsRun.status === "completed") {
      setLocalStatus("completed");
      setSubStatus("completed");
    } else if (dilapsRun.status === "error") {
      setLocalStatus("error");
      setSubStatus("error");
    } else if (dilapsRun.status !== subStatus) {
      setSubStatus(dilapsRun.status);
    }
  }, [dilapsRun?.status, localStatus, subStatus]);

  const reset = useCallback(() => {
    setDilapsId(null);
    setLocalStatus("idle");
    setSubStatus(null);
    setUploadProgress({ percent: 0, completedFiles: 0, totalFiles: 0 });
    setErrorMessage(null);
    mutation.reset();
  }, [mutation]);

  const isActive = ["presigning", "uploading", "generating"].includes(
    localStatus,
  );

  return {
    start: mutation.mutate,
    reset,
    dilapsId,
    status: localStatus,
    subStatus,
    progressPct: dilapsRun?.progress_pct ?? 0,
    totalSections: dilapsRun?.total_sections ?? 0,
    currentSection: dilapsRun?.current_section ?? 0,
    statusMessage: dilapsRun?.status_message ?? null,
    error: errorMessage || (mutation.error ? mutation.error.message : null),
    uploadProgress,
    isCompleted: localStatus === "completed",
    isActive,
    isLoading:
      mutation.isPending ||
      localStatus === "presigning" ||
      localStatus === "uploading",
  };
}
