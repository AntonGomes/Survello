"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import { ErrorAlert } from "@/components/error-alert";
import { FeatureHeader } from "@/components/feature-header";
import { DilapsStatusPanel } from "@/app/app/generate/status-panel";
import {
  DilapsUploadGrid,
  LinkedJobBanner,
} from "@/app/app/generate/upload-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDilapsGeneration } from "@/hooks/use-dilaps-generation";
import { useAuth } from "@/context/auth-context";

type UploadFiles = {
  leaseFile: File | null;
  leaseDocFiles: File[];
  siteNoteFiles: File[];
  surveyImageFiles: File[];
  miscFiles: File[];
};

const EMPTY_UPLOAD_FILES: UploadFiles = {
  leaseFile: null,
  leaseDocFiles: [],
  siteNoteFiles: [],
  surveyImageFiles: [],
  miscFiles: [],
};

function useJobIdFromParams() {
  const searchParams = useSearchParams();
  const param = searchParams.get("jobId");
  return param ? parseInt(param) : undefined;
}

export default function GeneratePage() {
  const jobId = useJobIdFromParams();
  const router = useRouter();
  const { user } = useAuth();

  const [files, setFiles] = useState<UploadFiles>(EMPTY_UPLOAD_FILES);
  const [propertyAddress, setPropertyAddress] = useState("");

  const generation = useDilapsGeneration();

  const canStart = useMemo(
    () =>
      Boolean(files.leaseFile) &&
      files.surveyImageFiles.length > 0 &&
      propertyAddress.trim().length > 0 &&
      !generation.isActive,
    [files.leaseFile, files.surveyImageFiles.length, propertyAddress, generation.isActive],
  );

  const handleStart = () => {
    generation.start({
      ...files,
      propertyAddress,
      jobId,
      orgId: user?.org_id ?? 0,
    });
  };

  if (generation.isCompleted && generation.dilapsId) {
    router.push(`/app/generate/review?dilapsId=${generation.dilapsId}`);
  }

  return (
    <>
      <FeatureHeader
        title="Generate Dilaps"
        badge={jobId ? `Job #${jobId}` : null}
      />

      {!generation.isCompleted && (
        <div className="px-8 pb-8 space-y-6">
          {jobId && <LinkedJobBanner jobId={jobId} />}

          <div className="space-y-2">
            <Label htmlFor="property-address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Property Address
            </Label>
            <Input
              id="property-address"
              placeholder="Enter the property address"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              disabled={generation.isActive}
            />
          </div>

          <DilapsUploadGrid files={files} onUpdate={setFiles} />
        </div>
      )}

      {generation.error && <ErrorAlert message={generation.error} />}

      {!generation.isCompleted && (
        <DilapsStatusPanel
          canStart={canStart}
          status={generation.status}
          subStatus={generation.subStatus}
          uploadProgress={generation.uploadProgress}
          progressPct={generation.progressPct}
          onStart={handleStart}
        />
      )}
    </>
  );
}
