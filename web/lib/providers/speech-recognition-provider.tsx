"use client";

import { useSpeechRecognition } from "react-speech-recognition";

export function SpeechRecognitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export { useSpeechRecognition };
