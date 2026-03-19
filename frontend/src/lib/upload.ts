const PERCENT_MULTIPLIER = 100;
const HTTP_OK_MIN = 200;
const HTTP_OK_MAX = 300;

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  fileIndex: number;
}

interface PresignedPut {
  put_url: string;
  mime_type: string;
  already_exists?: boolean;
}

interface UploadFilesToS3Options {
  files: File[];
  presignedPuts: PresignedPut[];
  onProgress?: (progress: number) => void;
}

export async function uploadFilesToS3({
  files,
  presignedPuts,
  onProgress,
}: UploadFilesToS3Options): Promise<void> {
  const totalFiles = files.length;
  let completedFiles = 0;

  
  
  const updateProgress = () => {
    if (onProgress) {
      const percent = Math.round((completedFiles / totalFiles) * PERCENT_MULTIPLIER);
      onProgress(percent);
    }
  };

  const uploadSingle = ({ file, putUrl, mimeType }: { file: File; putUrl: string; mimeType: string }) => {
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

        if (xhr.status >= HTTP_OK_MIN && xhr.status < HTTP_OK_MAX) {
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


      xhr.setRequestHeader("Content-Type", mimeType);
      console.log(`Uploading ${file.name} with Content-Type: ${mimeType} to ${putUrl.split('?')[0]}`);
      xhr.send(file);
    });
  };


  const uploads = files.map((file, index) => {
    const put = presignedPuts[index];
    if (!put) throw new Error(`No presigned URL found for file ${file.name}`);
    if (put.already_exists) {
      completedFiles++;
      updateProgress();
      return Promise.resolve();
    }
    return uploadSingle({ file, putUrl: put.put_url, mimeType: put.mime_type });
  });

  await Promise.all(uploads);
}
