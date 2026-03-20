import React, { useEffect, useState, useRef } from "react";

const DEFAULT_TYPE_SPEED_MS = 30;
const DEFAULT_DWELL_MS = 1500;

interface RollingUpdatesProps {
  updates: string[];
  typeSpeedMs?: number;
  dwellMs?: number;
}

function useRollingText({ updates, typeSpeedMs, dwellMs }: RollingUpdatesProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "dwelling">("typing");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, []);

  useEffect(() => {
    if (updates.length > 0 && displayIndex < updates.length - 1 && phase === "dwelling") {
      setDisplayIndex(prev => prev + 1);
      setDisplayedText("");
      setPhase("typing");
    }
  }, [updates.length, displayIndex, phase]);

  useEffect(() => {
    if (!updates || updates.length === 0) return;
    if (displayIndex >= updates.length) {
      setDisplayIndex(updates.length - 1);
      setDisplayedText(updates[updates.length - 1] ?? "");
      setPhase("dwelling");
      return;
    }
    const currentFullText = updates[displayIndex];
    if (!currentFullText) return;
    if (phase === "typing") {
      if (displayedText.length < currentFullText.length) {
        timeoutRef.current = setTimeout(() => {
          const chunk = Math.floor(Math.random() * 2) + 1;
          setDisplayedText(currentFullText.slice(0, displayedText.length + chunk));
        }, typeSpeedMs);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) };
      }
      setPhase("dwelling");
    } else if (phase === "dwelling" && displayIndex < updates.length - 1) {
      timeoutRef.current = setTimeout(() => { setDisplayIndex(prev => prev + 1); setDisplayedText(""); setPhase("typing") }, dwellMs);
      return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) };
    }
  }, [updates, displayIndex, displayedText, typeSpeedMs, dwellMs, phase]);

  return displayedText;
}

export const RollingUpdates: React.FC<RollingUpdatesProps> = ({
  updates,
  typeSpeedMs = DEFAULT_TYPE_SPEED_MS,
  dwellMs = DEFAULT_DWELL_MS,
}) => {
  const displayedText = useRollingText({ updates, typeSpeedMs, dwellMs });

  if (!updates.length) return <span className="animate-pulse text-muted-foreground font-mono">Initializing AI...</span>;

  return (
    <div className="min-h-[1.5em] flex items-center">
      <p className="text-foreground font-mono text-xs tracking-tight">
        {displayedText}
        <span className="animate-pulse inline-block w-1.5 h-4 ml-1 bg-primary align-middle" />
      </p>
    </div>
  );
};
