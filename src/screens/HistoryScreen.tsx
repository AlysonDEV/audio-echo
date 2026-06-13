import { StatusBar } from "expo-status-bar";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import type { ConnectionHistoryItem } from "../types";

interface HistoryScreenProps {
  history: ConnectionHistoryItem[];
  onSelect: (ip: string, port: string) => void;
  onClear: () => void;
  onBack: () => void;
}

export default function HistoryScreen({ history, onSelect, onClear, onBack }: HistoryScreenProps) {
  function formatDate(isoString: string) {
    try {
      const d = new Date(isoString);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return "Data indisponível";
    }
  }

  return (
    <View style={tw`flex-1 bg-slate-950`}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={tw`p-6`}>
        {history.length > 0 ? (
          <View style={tw`gap-4`}>
            {history.map((item) => (
              <TouchableOpacity
                key={`${item.ip}-${item.port}-${item.date}`}
                onPress={() => onSelect(item.ip, item.port)}
                style={tw`bg-slate-900 border border-slate-800/60 rounded-2xl p-4 flex-row justify-between items-center`}
              >
                <View style={tw`gap-1`}>
                  <Text style={tw`text-base font-mono font-bold text-teal-400`}>
                    {item.ip}:{item.port}
                  </Text>
                  <Text style={tw`text-xs text-slate-500`}>{formatDate(item.date)}</Text>
                </View>
                <View style={tw`px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl`}>
                  <Text style={tw`text-xs text-teal-400 font-bold`}>CONECTAR</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={tw`items-center py-20`}>
            <Text style={tw`text-4xl mb-4`}>📭</Text>
            <Text style={tw`text-sm text-slate-400 text-center mb-1 font-semibold`}>
              Nenhuma conexão anterior
            </Text>
            <Text style={tw`text-xs text-slate-500 text-center px-10 leading-relaxed`}>
              Seus computadores pareados aparecerão aqui após conectar com sucesso pela primeira
              vez.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
