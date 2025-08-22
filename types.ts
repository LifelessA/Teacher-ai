export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export enum PartType {
  EXPLANATION = 'explanation',
  VISUAL = 'visual',
}

export interface ExplanationPart {
  type: PartType.EXPLANATION;
  text: string;
}

export interface VisualPart {
  type: PartType.VISUAL;
  html: string;
  isSummary?: boolean;
}

export type ContentPart = ExplanationPart | VisualPart;

export interface Message {
  role: MessageRole;
  content?: string; // For user messages, errors, and simple initial messages
  parts?: ContentPart[]; // For complex, multi-part explanations from the model
  id: string;
  isError?: boolean;
  file?: {
    name: string;
    type: string;
  }
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
}
