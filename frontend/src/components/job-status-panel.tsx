import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RollingUpdates } from "@/components/rolling-updates";
import { Progress } from "@/components/ui/progress";
import { Status } from "@/hooks/use-document-generation";

type Props = {
  canStart: boolean;
  status: Status;
  uploadProgress: number;
  onStart: () => void;
  updates: string[];
};

export function JobStatusPanel({
  canStart,
  status,
  uploadProgress,
  onStart,
  updates,
}: Props) {
  const [showDetails, setShowDetails] = useState(true);

  const isIdle = status === "idle" || status === "error";
  const isPresigning = status === "presigning";
  const isUploading = status === "uploading";
  
  // Progress bar is "done" when we hit 100%. We use this to trigger the fade out.
  const isProgressDone = uploadProgress >= 100;
  const isGenerating = status === "generating";

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
              className="px-8 py-6 text-lg rounded-xl hover:shadow-lg transition-all disabled:opacity-50 border border-accent/30 shadow-[0_14px_38px_-18px_rgba(83,162,85,0.45)]"
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
                  {isPresigning && "Preparing your files..."}
                  {isUploading && "Uploading files to storage..."}
                  {isGenerating && "Generating your document..."}
                </p>

                <div className="text-xs text-muted-foreground mt-1">
                  {isPresigning && "Preparing your files for upload..."}
                  {isUploading && `Securely storing your files for our AI to analyse..`}
                  {isGenerating && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowDetails((prev) => !prev)}
                        className="flex items-center"
                      >
                        <span>
                          See what the AI is thinking
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 ml-1 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
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

                {/* Progress Bar with smooth exit transition */}
                {(isPresigning || isUploading) && (
                  <div 
                    className={`
                      mt-3 transition-all ease-in-out overflow-hidden
                      ${isProgressDone 
                        ? "max-h-0 opacity-0 mt-0 duration-700 delay-500" 
                        : "max-h-20 opacity-100 duration-300"}
                    `}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                        <span>Upload progress</span>
                        <span className="text-foreground font-semibold">{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={Math.round(uploadProgress)} className="h-2.5 bg-primary/10" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}