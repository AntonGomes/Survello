const PERCENT_MULTIPLIER = 100;
const HTTP_OK_MIN = 200;
const HTTP_OK_MAX = 300;

export interface UploadProgress {
  percent: number;
  completedFiles: number;
  totalFiles: number;
}

interface UploadFilesToS3Options {
  files: File[];
  presignedPuts: { put_url: string; mime_type: string }[];
  onProgress?: (progress: UploadProgress) => void;
}

export async function uploadFilesToS3({
  files,
  presignedPuts,
  onProgress,
}: UploadFilesToS3Options): Promise<void> {
  const totalFiles = files.length;
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  const loadedPerFile = new Array<number>(totalFiles).fill(0);
  let completedFiles = 0;

  const updateProgress = () => {
    if (!onProgress) return;
    const loadedBytes = loadedPerFile.reduce((sum, b) => sum + b, 0);
    const percent = totalBytes > 0
      ? Math.round((loadedBytes / totalBytes) * PERCENT_MULTIPLIER)
      : Math.round((completedFiles / totalFiles) * PERCENT_MULTIPLIER);
    onProgress({ percent, completedFiles, totalFiles });
  };

  const uploadSingle = ({ file, putUrl, mimeType, index }: {
    file: File;
    putUrl: string;
    mimeType: string;
    index: number;
  }) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          loadedPerFile[index] = e.loaded;
          updateProgress();
        }
      };

      xhr.onload = () => {
        if (xhr.status >= HTTP_OK_MIN && xhr.status < HTTP_OK_MAX) {
          loadedPerFile[index] = file.size;
          completedFiles++;
          updateProgress();
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error(`Network error uploading ${file.name}`));
      };

      xhr.open("PUT", putUrl);
      xhr.setRequestHeader("Content-Type", mimeType);
      xhr.send(file);
    });
  };

  const uploads = files.map((file, index) => {
    const put = presignedPuts[index];
    if (!put) throw new Error(`No presigned URL found for file ${file.name}`);
    return uploadSingle({ file, putUrl: put.put_url, mimeType: put.mime_type, index });
  });

  await Promise.all(uploads);
}
