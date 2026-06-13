import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ConnectionHistoryItem } from "../types";

const HISTORY_KEY = "@estacao_replay_history";

export async function loadHistory(): Promise<ConnectionHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw) as ConnectionHistoryItem[];
    }
  } catch (err) {
    console.error("Failed to load connection history:", err);
  }
  return [];
}

export async function saveConnection(ip: string, port: string): Promise<ConnectionHistoryItem[]> {
  try {
    const history = await loadHistory();

    // Filter out previous entry if it is duplicate, so we push it to the top
    const filtered = history.filter((item) => !(item.ip === ip && item.port === port));

    const newItem: ConnectionHistoryItem = {
      ip,
      port,
      date: new Date().toISOString(),
    };

    // Prepend to top
    const updated = [newItem, ...filtered].slice(0, 10); // Limit to last 10 entries

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save connection history:", err);
  }
  return [];
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error("Failed to clear connection history:", err);
  }
}
