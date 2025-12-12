import React, { useCallback, useEffect, useState } from "react";

interface TypingTitleProps {
  updates: string[];
  tokenDelayMs?: number;
  dwellMs?: number;
}

export const RollingUpdates: React.FC<TypingTitleProps> = ({
  updates,
  tokenDelayMs = 80,
  dwellMs = 2000,
}) => {
  const [baseText, setBaseText] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [tokenIndex, setTokenIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [dotCount, setDotCount] = useState(0);

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

  // Animate trailing dots: . (200ms) -> .. (200ms) -> ... (1s) -> repeat
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const tick = (current: number) => {
      const next = (current + 1) % 4; // 0..3 dots
      const delay = current === 2 ? 1000 : 200; // linger on "..." for 1s
      timeout = setTimeout(() => tick(next), delay);
      setDotCount(next);
    };
    tick(dotCount);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseText]);

  const textToShow =
    updates.length === 0 ? "Initialising model and context..." : displayed || " ";

  return (
    <p className="text-xs text-muted-foreground font-mono">
            {textToShow}
            {".".repeat(dotCount)}
    </p>
  );
};
