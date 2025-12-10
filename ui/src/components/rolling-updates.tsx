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
    className="size-8 text-primary animate-spin animate-[pulse_2s_cubic-bezier(0.4,_0,_0.6,_1)_infinite]"
  />
);

export const RollingUpdates: React.FC<TypingTitleProps> = ({
  updates,
  tokenDelayMs = 80,
  dwellMs = 2000,
}) => {
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
    const latest = updates[updates.length - 1] ?? "";
    if (!latest) {
      setBaseText("");
      setTokens([]);
      setDisplayed("");
      setTokenIndex(0);
      return;
    }

    // Only restart typing when the latest message changes
    if (latest === baseText) return;

    setBaseText(latest);
    setTokens(chunkIntoTokens(latest));
    setDisplayed("");
    setTokenIndex(0);
  }, [updates, baseText, chunkIntoTokens]);

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

    // Finished typing this update; wait for a new one
    if (tokenIndex >= tokens.length) return;
  }, [tokenIndex, tokens, tokenDelayMs, dwellMs, updates.length]);

  const textToShow =
    updates.length === 0 ? "Initialising model and context..." : displayed || " ";

  return (
    <p className="text-xs text-muted-foreground font-mono">
            {textToShow}
    </p>
  );
};
