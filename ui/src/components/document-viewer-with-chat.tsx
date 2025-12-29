import { DownloadButton } from "./download-button";


export function DocumentViewerWithChat({ downloadPath, previewUrl }: { downloadPath: string, previewUrl: string }) {
    return (
        <>
        <div className="h-[700px]">
        <iframe
            src={previewUrl}
            className="w-full h-full border rounded-md"
            title="Generated Document"
        />
        </div>
        <DownloadButton downloadPath={downloadPath} />
        </>
    );
    }