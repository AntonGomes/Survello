import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RollingUpdates } from "@/components/rolling-updates";
import { Progress } from "@/components/ui/progress";
import { Status } from "@/hooks/generate-doc";

type Props = {
  canStart: boolean;
  isStreaming: boolean;
  status: Status;
  uploadProgress: number;
  onStart: () => void;
  updates: string[];
};

export function JobStatusPanel({
  canStart,
  isStreaming,
  status,
  uploadProgress,
  onStart,
  updates,
}: Props) {
  const [showDetails, setShowDetails] = useState(true);

  const isIdle = status === "idle" || status === "error";
  const showProgress = !isIdle && uploadProgress < 100;
  const isPresigning = status === "presigning";
  const isUploading = status === "uploading";
  const isCreating = status === "creating";
  const isGenerating = status === "streaming" || uploadProgress >= 100;

  return (
    <div className="flex justify-center mb-8">
      <div
        className={`
          w-full mx-auto 
          transition-all duration-500 ease-out
          ${!isIdle ? "max-w-3xl" : "max-w-md"}
        `}
      >
        {isIdle && (
          <div className="flex justify-center">
            <Button
              onClick={onStart}
              disabled={!canStart}
              size="lg"
              variant="accent"
              className="px-8 py-6 text-lg rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 border border-accent/30 shadow-[0_14px_38px_-18px_rgba(83,162,85,0.45)]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Document
            </Button>
          </div>
        )}

        {!isIdle && (
          <div className="bg-card rounded-2xl shadow-lg border border-border px-6 py-5 transition-all duration-500 ease-out">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {showProgress
                    ? isUploading
                      ? "Uploading your files"
                      : isPresigning
                        ? "Preparing uploads"
                        : "Starting your job"
                    : "Generating document…"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {showProgress
                    ? isUploading
                      ? "Securely transferring your template and context to storage."
                      : "Getting things ready… we’ll begin generating in a moment."
                    : "We are reading your files, extracting the details and filling your template."}
                </p>

                {showProgress && (
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      <span>Upload progress</span>
                      <span className="text-foreground font-semibold">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={Math.round(uploadProgress)} className="h-2.5 bg-primary/10" />
                  </div>
                )}

                {isGenerating && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowDetails((prev) => !prev)}
                      className="mt-4 w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <p className="text-xs text-muted-foreground mt-1">See what the AI is thinking</p>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
                      />
                    </button>

                    <div
                      className={`
                        overflow-hidden transition-all duration-500 ease-out
                        ${showDetails ? "max-h-40 mt-2 opacity-100" : "max-h-0 opacity-0"}
                      `}
                    >
                      <div className="text-xs sm:text-sm text-foreground bg-accent/5 border border-accent/20 rounded-lg px-3 py-3">
                        <RollingUpdates updates={updates} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
