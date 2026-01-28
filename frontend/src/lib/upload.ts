
export interface UploadProgressEvent {
  loaded: number;
  total: number;
  fileIndex: number;
}

export async function uploadFilesToS3(
  files: File[], 
  presignedPuts: { put_url: string; mime_type: string }[],
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

  const uploadSingle = (file: File, putUrl: string, mimeType: string) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.onload = () => {
        console.log(`Upload response for ${file.name}:`, {
          status: xhr.status,
          statusText: xhr.statusText,
          etag: xhr.getResponseHeader('ETag'),
          allHeaders: xhr.getAllResponseHeaders(),
          response: xhr.responseText
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          completedFiles++;
          updateProgress();
          resolve();
          console.log(`Successfully uploaded ${file.name}, url: ${putUrl.split('?')[0]}.`);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => {
        console.error(`Network error uploading ${file.name}`);
        reject(new Error("Network error during upload"));
      };
      
      xhr.open("PUT", putUrl);
      // Use the exact mime_type that was used to generate the presigned URL
      // The Content-Type header is signed, so it MUST match exactly
      xhr.setRequestHeader("Content-Type", mimeType);
      console.log(`Uploading ${file.name} with Content-Type: ${mimeType} to ${putUrl.split('?')[0]}`);
      xhr.send(file);
    });
  };

  // Upload files in parallel, matching each file to its presigned URL by index
  const uploads = files.map((file, index) => {
    const put = presignedPuts[index];
    if (!put) throw new Error(`No presigned URL found for file ${file.name}`);
    return uploadSingle(file, put.put_url, put.mime_type);
  });

  await Promise.all(uploads);
}
