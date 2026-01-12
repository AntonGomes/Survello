import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  downloadPath: string;
};

export function DownloadButton({ downloadPath }: Props) {
  return (
    <div className="flex justify-center my-8">
      <Button
        variant="accent"
        size="lg"
        className="h-14 px-8 py-6 text-lg shadow-md hover:shadow-lg"
        asChild
      >
        <a href={downloadPath} download>
          <Download className="w-5 h-5 mr-2" />
          Download Generated Document
        </a>
      </Button>
    </div>
  );
}
