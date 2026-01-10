"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, Microphone, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchInput } from "../hooks/use-search-input";
import { useSpeechRecognition } from "@/lib/providers/speech-recognition-provider";
import SpeechRecognition from "react-speech-recognition";
import type { SearchInputProps } from "../types";

export function SearchInput<T>({
  placeholder = "Search...",
  className,
  onResultClick,
  renderResult,
  ...options
}: SearchInputProps<T>) {
  const { query, setQuery, results, isSearching } = useSearchInput(options);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript, setQuery]);

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: false,
        language: "en-US",
      });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <Spinner className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {browserSupportsSpeechRecognition && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleMicClick}
              className={cn(
                "h-7 w-7",
                listening && "bg-primary/10 text-primary"
              )}
            >
              <Microphone
                className={cn("h-4 w-4", listening && "animate-pulse")}
              />
            </Button>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="rounded-lg border bg-card p-2 max-h-64 overflow-y-auto">
          {results.map((item, index) => (
            <div
              key={index}
              onClick={() => onResultClick?.(item)}
              className={cn(
                "rounded-md p-2 cursor-pointer transition-colors",
                "hover:bg-muted",
                onResultClick && "cursor-pointer"
              )}
            >
              {renderResult ? renderResult(item) : String(item)}
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
          No results found
        </div>
      )}
    </div>
  );
}
