"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneEmptyState,
  DropzoneContent,
} from "@/components/ui/shadcn-io/dropzone";
import { RollingUpdates } from "@/components/rolling-updates";

import {
  FileText,
  Image,
  Sparkles,
  Download,
  Loader2,
  ChevronDown,
} from "lucide-react";

// --- New Component for Download Button ---
const DownloadButton = ({ downloadPath }: { downloadPath: string }) => (
  <div className="flex justify-center my-8">
    <a
      href={downloadPath}
      download
      className="
        inline-flex items-center justify-center 
        h-14 px-8 py-6 text-lg 
        rounded-xl shadow-lg hover:shadow-xl transition-all 
        text-white font-medium 
        bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
      "
    >
      <Download className="w-5 h-5 mr-2" />
      Download Generated Document
    </a>
  </div>
);
// ------------------------------------------

export default function Home() {
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string>("")

  const [modelUpdates, setModelUpdates] = useState<string[]>([]);
  const [completed, setCompleted] = useState<boolean>(false);

  // For the subtle accordion around RollingUpdates
  const [showDetails, setShowDetails] = useState<boolean>(true);

  const formatUpdate = (updateString: string) => {
    const withoutQuotes = updateString.replace(/['"]/g, "");
    const lines = withoutQuotes.split(/\r?\n/);
    return lines;
  };

  const startStream = async () => {
    setError(null);
    setModelUpdates([]); // Clear previous run updates
    setIsStreaming(true);

    try {
      const form = new FormData();
      contextFiles.forEach((f) => form.append("contextFiles", f));

      if (templateFile) {
        form.append("templateFiles", templateFile);
      } else {
        setError("Template file is missing.");
        setIsStreaming(false);
        return;
      }

      const res = await fetch("/api/upload", { method: "POST", body: form });

      if (!res.ok) {
        setError("Upload failed.");
        setIsStreaming(false);
        return;
      }

      const { jobId: newJobId } = await res.json(); // <-- match your backend key
      setJobId(newJobId);

      const es = new EventSource(`/api/stream/${newJobId}`);

      es.onopen = () => {
        console.log("EventSource connection opened");
      };

      es.onerror = (e) => {
        console.error("EventSource error:", e);
        if (es.readyState === EventSource.CLOSED && !completed) {
          setError("Connection interrupted. The generation may have failed.");
          setIsStreaming(false);
        }
      };

      const eventTypes = [
        "response.code_interpreter_call_code.done",
        "response.output_text.done",
      ] as const;

      eventTypes.forEach((eventType) => {
        es.addEventListener(eventType, (e: MessageEvent) => {
          const raw = e.data ?? "";
          if (!raw) return;
          const update = JSON.parse(raw);
          console.log(`${eventType}: ${update}`);
          setModelUpdates((prev) => prev.concat(formatUpdate(update)));
        });
      });

      // COMPLETED – expose download link
      es.addEventListener("completed", (e: MessageEvent) => {
        setCompleted(true);
        es.close();
        setIsStreaming(false);
      });

      // ERROR event from server
      es.addEventListener("modelError", (e: MessageEvent) => {
        console.error("Server error event:", e.data);
        setError(`Server error: ${e.data}`);
        setIsStreaming(false);
        es.close();
      });
    } catch (err) {
      console.error("Stream initialization error:", err);
      setError("Failed to start generation. Please try again.");
      setIsStreaming(false);
    }
  };

  const isIdle = !isStreaming && !completed;
  const isGenerating = isStreaming && !completed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Document Generator
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Instructions Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            How it works
          </h2>
          <div className="flex flex-col md:flex-row gap-6 text-sm text-slate-600">
            <div className="flex gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-medium text-slate-900 mb-1">
                  Add context
                </div>
                Upload images or documents for reference
              </div>
            </div>
            <div className="flex gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-medium text-slate-900 mb-1">
                  Choose template
                </div>
                Upload your document template
              </div>
            </div>
            <div className="flex gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-medium text-slate-900 mb-1">Generate</div>
                Let AI create your document
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Context Files */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Image className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Context Files
              </h3>
              <span className="text-xs text-slate-500 ml-auto">Optional</span>
            </div>
            <Dropzone
              maxFiles={100}
              onDrop={setContextFiles}
              src={contextFiles}
              className="border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl bg-slate-50/50"
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
            {contextFiles.length > 0 && (
              <p className="text-sm text-slate-600 mt-3">
                {contextFiles.length} file
                {contextFiles.length !== 1 ? "s" : ""} added
              </p>
            )}
          </div>

          {/* Template File */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Template File
              </h3>
              <span className="text-xs text-red-500 ml-auto">Required</span>
            </div>
            <Dropzone
              maxFiles={1}
              onDrop={(files) => setTemplateFile(files[0] || null)}
              src={templateFile ? [templateFile] : []}
              className="border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl bg-slate-50/50"
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
            {templateFile && (
              <p className="text-sm text-slate-600 mt-3">
                {templateFile.name}
              </p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action / Loading / Download Flow */}
        <div className="flex justify-center mb-8">
          <div
            className={`
              w-full mx-auto 
              transition-all duration-500 ease-out
              ${isGenerating ? "max-w-3xl" : "max-w-md"}
            `}
          >
            {isIdle && (
              <div className="flex justify-center">
                <Button
                  onClick={startStream}
                  disabled={isStreaming || !templateFile}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Document
                </Button>
              </div>
            )}

            {isGenerating && (
              <div
                className="
                  bg-white rounded-2xl shadow-lg border border-slate-200 
                  px-6 py-5 
                  transition-all duration-500 ease-out
                "
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Generating document…
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      We are reading your files, extracting the details and
                      filling your template.
                    </p>

                    {/* Accordion toggle */}
                    <button
                      type="button"
                      onClick={() => setShowDetails((prev) => !prev)}
                      className="
                        mt-4 w-full flex items-center justify-between
                        text-xs font-medium
                        text-slate-500 hover:text-slate-700
                        transition-colors
                      "
                    >
                      <p className="text-xs text-slate-500 mt-1">
                      See what the AI is thinking
                      </p>
                      <ChevronDown
                        className={`
                          w-4 h-4 transition-transform duration-300 
                          ${showDetails ? "rotate-180" : ""}
                        `}
                      />
                    </button>

                    {/* Accordion content */}
                    <div
                      className={`
                        overflow-hidden transition-all duration-500 ease-out
                        ${showDetails ? "max-h-40 mt-2 opacity-100" : "max-h-0 opacity-0"}
                      `}
                    >
                      <div className="text-xs sm:text-sm text-slate-700 bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-3">
                        <RollingUpdates updates={modelUpdates} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {completed && jobId && templateFile && (
            <DownloadButton
              downloadPath={`/api/download/${jobId}/${encodeURIComponent(
                templateFile.name
              )}`}
            />
          )}

          </div>
        </div>
      </div>
    </div>
  );
}