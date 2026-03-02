import type { MessageSafetyCheckOutput } from "@/ai/flows/message-safety-check";

export type Role = "Child" | "Parent" | "Teacher";

export type Sentiment = "Negative" | "Neutral" | "Positive";

export interface Conversation {
  id: string;
  timestamp: number;
  role: Role;
  audioDataUri?: string;
  textMessage?: string;
  transcription: string;
  rephrased: string;
  sentiment: Sentiment;
  explanation: string;
  safety: MessageSafetyCheckOutput;
  isCrisis?: boolean;
}
