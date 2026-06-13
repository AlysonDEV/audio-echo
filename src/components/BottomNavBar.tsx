import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";

interface BottomNavBarProps {
  currentScreen: "transmitter" | "history";
  onScreenChange: (screen: "transmitter" | "history") => void;
}

export default function BottomNavBar({ currentScreen, onScreenChange }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();

  // Ensure there is minimum padding at the bottom of the navigation bar
  const paddingBottom = Math.max(insets.bottom, 12);

  return (
    <View
      style={[
        tw`flex-row bg-slate-900 border-t border-slate-800/80 justify-around items-center pt-3 pb-2`,
        { paddingBottom },
      ]}
    >
      <TouchableOpacity
        onPress={() => onScreenChange("transmitter")}
        style={tw`items-center flex-1`}
        activeOpacity={0.7}
      >
        <Text style={tw`text-xl mb-1 ${currentScreen === "transmitter" ? "" : "opacity-45"}`}>
          🎙️
        </Text>
        <Text
          style={tw`text-xs font-semibold tracking-wide ${
            currentScreen === "transmitter" ? "text-teal-400 font-bold" : "text-slate-500"
          }`}
        >
          Transmissor
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onScreenChange("history")}
        style={tw`items-center flex-1`}
        activeOpacity={0.7}
      >
        <Text style={tw`text-xl mb-1 ${currentScreen === "history" ? "" : "opacity-45"}`}>🕒</Text>
        <Text
          style={tw`text-xs font-semibold tracking-wide ${
            currentScreen === "history" ? "text-teal-400 font-bold" : "text-slate-500"
          }`}
        >
          Histórico
        </Text>
      </TouchableOpacity>
    </View>
  );
}
