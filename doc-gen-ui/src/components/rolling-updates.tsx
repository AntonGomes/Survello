import React, { useCallback, useEffect, useState } from "react";
import { ItemContent, ItemTitle, Item, ItemMedia } from "./ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Loader2 } from "lucide-react"; // Import Loader2 for the activity indicator

interface TypingTitleProps {
  updates: string[];
  tokenDelayMs?: number;
  dwellMs?: number;
}

// Custom Activity Indicator using Loader2 for a "breathing" effect
const ActivityIndicator = () => (
  // Use an icon with a gentle animation instead of a standard spinner
  <Loader2
    className="size-8 text-blue-500 animate-spin animate-[pulse_2s_cubic-bezier(0.4,_0,_0.6,_1)_infinite]"
  />
);

export const RollingUpdates: React.FC<TypingTitleProps> = ({
  updates,
  tokenDelayMs = 80,
  dwellMs = 2000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [baseText, setBaseText] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [tokenIndex, setTokenIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");

  // Chunk text into fake tokens of 3–4 characters
  const chunkIntoTokens = useCallback((text: string): string[] => {
    const tokens: string[] = [];
    let i = 0;
    while (i < text.length) {
      const chunkSize = Math.floor(Math.random() * 2) + 3; // 3–4 chars
      tokens.push(text.slice(i, i + chunkSize));
      i += chunkSize;
    }
    return tokens;
  }, []);

  // When currentIndex changes (or the text at that index changes),
  // (re)initialise the typing state.
  useEffect(() => {
    if (updates.length === 0) {
      setBaseText("");
      setTokens([]);
      setDisplayed("");
      setTokenIndex(0);
      setCurrentIndex(0);
      return;
    }

    // Clamp index if updates got shorter (unlikely, but safe)
    if (currentIndex > updates.length - 1) {
      setCurrentIndex(updates.length - 1);
      return;
    }

    const nextText = updates[currentIndex] ?? "";

    // If the text for this index has not changed, don’t restart typing
    if (nextText === baseText) return;

    setBaseText(nextText);
    setTokens(chunkIntoTokens(nextText));
    setDisplayed("");
    setTokenIndex(0);

    // When a new update arrives, always jump to the start of the updates.
    // This ensures if the user provided 3 updates instantly, we cycle through them.
    if (updates.length > 0) {
      setCurrentIndex(updates.length - 1);
    }
  }, [updates, baseText, chunkIntoTokens, currentIndex]);

  // Typing effect + advancing to the next update
  useEffect(() => {
    if (updates.length === 0) return;
    if (!tokens.length) return;

    // Still typing this update
    if (tokenIndex < tokens.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + tokens[tokenIndex]);
        setTokenIndex((prev) => prev + 1);
      }, tokenDelayMs);

      return () => clearTimeout(timeout);
    }

    // Finished typing this update; dwell before moving on
    // This logic is designed to loop between *received* updates
    if (tokenIndex >= tokens.length && updates.length > 1) {
      const timeout = setTimeout(() => {
        // If we are showing the latest update, do nothing until a new one arrives.
        // If there are older updates, cycle through them.
        if (currentIndex < updates.length - 1) {
          setCurrentIndex(updates.length - 1);
        } else if (currentIndex > 0) {
          // Start cycling from the second-to-last update upwards,
          // or just stay on the last one if it's the only one.
          setCurrentIndex(0);
        }
      }, dwellMs);

      return () => clearTimeout(timeout);
    }
  }, [tokenIndex, tokens, tokenDelayMs, dwellMs, currentIndex, updates.length]);

  const textToShow =
    updates.length === 0 ? "Initialising model and context..." : displayed || " ";

  return (
    <p className="text-xs text-slate-500 font-mono">
            {textToShow}
    </p>
  );
};