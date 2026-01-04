import { type PresignedPut } from "@/client/types.gen";

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  fileIndex: number;
}

export async function uploadFilesToS3(
  files: File[], 
  presignedPuts: PresignedPut[],
  onProgress?: (progress: number) => void
): Promise<void> {
  const totalFiles = files.length;
  let completedFiles = 0;

  // Simple progress tracker: (completed / total) * 100
  // For more granular progress, we'd need to track bytes per file
  const updateProgress = () => {
    if (onProgress) {
      const percent = Math.round((completedFiles / totalFiles) * 100);
      onProgress(percent);
    }
  };

  const uploadSingle = (file: File, putUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          completedFiles++;
          updateProgress();
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      
      xhr.open("PUT", putUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.send(file);
    });
  };

  // TODO: Upload by matching id of file to presigned url or some other way that 
  // isn;t just iterating ove the array as this is risky
  const uploads = files.map((file, index) => {
    // The presignedPuts array might include the template file at index 0, 
    // so we need to be careful about matching.
    // In the current logic, we usually pass [template, ...context] to both.
    const put = presignedPuts[index];
    if (!put) throw new Error(`No presigned URL found for file ${file.name}`);
    return uploadSingle(file, put.put_url);
  });

  await Promise.all(uploads);
}
