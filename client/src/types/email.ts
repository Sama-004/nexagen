export interface Email {
  id: number;
  messageId: string;
  sender: string;
  subject: string;
  timestamp: number;
  processed: boolean;
}
