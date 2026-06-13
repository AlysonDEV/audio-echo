export function parseQrCode(data: string): { ip: string; port: string } | null {
  try {
    let ip = "";
    let port = "3001";

    if (data.startsWith("http://") || data.startsWith("https://")) {
      const cleaned = data.split("://")[1];
      const host = cleaned.split("/")[0];
      const hostParts = host.split(":");
      ip = hostParts[0];
      if (hostParts[1]) {
        port = hostParts[1];
      }
    } else {
      const hostParts = data.split(":");
      ip = hostParts[0];
      if (hostParts[1]) {
        port = hostParts[1];
      }
    }

    if (ip && ip.split(".").length === 4) {
      return { ip, port };
    }
  } catch (err) {
    console.error("Failed to parse QR Code:", err);
  }
  return null;
}
