import { Platform } from "react-native";

export function logErrorToServer(
  error: Error | string,
  isFatal = false,
  ip?: string,
  port?: string,
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.warn(`[ERROR CAPTURED] ${message}`);

  if (ip && port) {
    fetch(`http://${ip}:${port}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        stack,
        platform: `${Platform.OS}${isFatal ? " (FATAL)" : ""}`,
      }),
    }).catch((err) => {
      console.error("Failed to post error log:", err);
    });
  }
}
