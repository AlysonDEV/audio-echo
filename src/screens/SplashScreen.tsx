import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, Text, View } from "react-native";
import tw from "twrnc";

export default function SplashScreen() {
  return (
    <View style={tw`flex-1 bg-slate-950 justify-center items-center px-6`}>
      <StatusBar style="light" />
      <View style={tw`items-center`}>
        {/* App Logo */}
        <Image
          source={require("../../assets/logo-transparent.png")}
          style={tw`w-28 h-28 mb-6`}
          resizeMode="contain"
        />

        {/* App Title */}
        <Text style={tw`text-3xl font-extrabold text-slate-100 tracking-tight`}>
          Estação Replay
        </Text>
        <Text style={tw`text-sm text-slate-400 mt-2 text-center`}>
          Transmitindo áudio com latência ultrabaixa
        </Text>

        {/* Loading Spinner */}
        <View style={tw`mt-12 flex-row items-center gap-3`}>
          <ActivityIndicator size="small" color="#2dd4bf" />
          <Text style={tw`text-xs text-slate-500 font-medium`}>Carregando conexão rápida...</Text>
        </View>
      </View>
    </View>
  );
}
