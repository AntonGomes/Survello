import React, { useEffect, useState, useRef, useCallback } from "react";

interface RollingUpdatesProps {
  updates: string[];
  typeSpeedMs?: number; // Speed of typing
  dwellMs?: number;     // Time to wait after typing finishes before showing next
}

export const RollingUpdates: React.FC<RollingUpdatesProps> = ({
  updates,
  typeSpeedMs = 30,
  dwellMs = 1500,
}) => {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "dwelling">("typing");
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle new updates coming in - jump to latest if we've fallen behind
  useEffect(() => {
    if (updates.length > 0 && displayIndex < updates.length - 1 && phase === "dwelling") {
      // New updates arrived while dwelling, move to next
      setDisplayIndex(prev => prev + 1);
      setDisplayedText("");
      setPhase("typing");
    }
  }, [updates.length, displayIndex, phase]);

  // Main typing/dwelling effect
  useEffect(() => {
    if (!updates || updates.length === 0) return;

    // Clamp display index to valid range
    if (displayIndex >= updates.length) {
      setDisplayIndex(updates.length - 1);
      setDisplayedText(updates[updates.length - 1] ?? "");
      setPhase("dwelling");
      return;
    }

    const currentFullText = updates[displayIndex];
    if (!currentFullText) return;

    if (phase === "typing") {
      // Still typing current message
      if (displayedText.length < currentFullText.length) {
        timeoutRef.current = setTimeout(() => {
          // Type 1-3 chars at a time for a more natural feel
          const chunk = Math.floor(Math.random() * 2) + 1;
          setDisplayedText(currentFullText.slice(0, displayedText.length + chunk));
        }, typeSpeedMs);
        return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
      } else {
        // Finished typing, start dwelling
        setPhase("dwelling");
      }
    } else if (phase === "dwelling") {
      // Check if there are more messages to show
      if (displayIndex < updates.length - 1) {
        timeoutRef.current = setTimeout(() => {
          setDisplayIndex(prev => prev + 1);
          setDisplayedText("");
          setPhase("typing");
        }, dwellMs);
        return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
      }
      // Otherwise, stay on the last message
    }
  }, [updates, displayIndex, displayedText, typeSpeedMs, dwellMs, phase]);

  // Handle initial load or empty state
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
