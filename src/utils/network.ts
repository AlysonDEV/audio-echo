import * as Network from "expo-network";
import { Platform } from "react-native";

async function pingServer(targetIp: string, port: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 400); // 400ms timeout for local ping

  try {
    const response = await fetch(`http://${targetIp}:${port}/api/ips`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      return targetIp;
    }
  } catch {
    clearTimeout(timeoutId);
  }
  return null;
}

export async function scanSubnet(
  subnetBase: string,
  port: string,
  onProgress: (pct: number) => void,
): Promise<string | null> {
  const batchSize = 30; // 30 concurrent requests to avoid overwhelming the stack
  for (let i = 1; i <= 254; i += batchSize) {
    const promises: Promise<string | null>[] = [];
    const end = Math.min(i + batchSize - 1, 254);

    for (let j = i; j <= end; j++) {
      const targetIp = `${subnetBase}.${j}`;
      promises.push(pingServer(targetIp, port));
    }

    const results = await Promise.all(promises);
    const foundIp = results.find((ip) => ip !== null);
    if (foundIp) {
      return foundIp;
    }

    onProgress(Math.round((end / 254) * 100));
  }
  return null;
}

export async function getDeviceIp(): Promise<string> {
  if (Platform.OS === "web") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return hostname;
    }
  } else {
    return await Network.getIpAddressAsync();
  }
  return "";
}
