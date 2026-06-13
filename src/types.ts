export interface ConnectionHistoryItem {
  ip: string;
  port: string;
  date: string; // ISO String or formatted date
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected";
