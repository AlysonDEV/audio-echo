import { Image, Linking, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const handleEmailPress = () => {
    Linking.openURL("mailto:devalyson@gmail.com").catch((err) =>
      console.error("Erro ao abrir email:", err),
    );
  };

  const handleGithubPress = () => {
    Linking.openURL("https://github.com/AlysonDEV").catch((err) =>
      console.error("Erro ao abrir GitHub:", err),
    );
  };

  return (
    <View style={tw`flex-1 bg-slate-950 px-6 justify-center`}>
      <View style={tw`w-full max-w-md mx-auto`}>
        {/* Card */}
        <View
          style={tw`bg-slate-900 border border-slate-800 rounded-3xl p-6 items-center shadow-lg shadow-teal-500/5`}
        >
          {/* Transparent Logo */}
          <Image
            source={require("../../assets/logo-transparent.png")}
            style={tw`w-24 h-24 mb-4`}
            resizeMode="contain"
          />

          {/* App Title */}
          <Text style={tw`text-2xl font-bold text-slate-100`}>Estação Replay</Text>
          <Text style={tw`text-xs text-slate-500 mt-1`}>Versão 1.0.0</Text>

          {/* Description */}
          <Text style={tw`text-sm text-slate-400 text-center mt-4 mb-6 leading-relaxed px-2`}>
            Aplicativo transmissor de áudio sem fio em tempo real com latência ultrabaixa para
            computadores Windows.
          </Text>

          {/* Separator */}
          <View style={tw`w-full h-px bg-slate-800 mb-6`} />

          {/* Developer Details */}
          <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider mb-3`}>
            Desenvolvedor
          </Text>

          <Text style={tw`text-lg font-extrabold text-slate-100 mb-4`}>Alyson Ronnan Martins</Text>

          {/* Links */}
          <View style={tw`w-full gap-3`}>
            {/* Email Button */}
            <TouchableOpacity
              onPress={handleEmailPress}
              style={tw`w-full py-3 bg-slate-950 border border-slate-800 rounded-xl flex-row justify-center items-center gap-2`}
              activeOpacity={0.7}
            >
              <Text style={tw`text-base`}>✉️</Text>
              <Text style={tw`text-slate-300 font-medium text-xs`}>devalyson@gmail.com</Text>
            </TouchableOpacity>

            {/* GitHub Button */}
            <TouchableOpacity
              onPress={handleGithubPress}
              style={tw`w-full py-3 bg-slate-950 border border-slate-800 rounded-xl flex-row justify-center items-center gap-2`}
              activeOpacity={0.7}
            >
              <Text style={tw`text-base`}>🔗</Text>
              <Text style={tw`text-slate-300 font-medium text-xs`}>github.com/AlysonDEV</Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            onPress={onBack}
            style={tw`mt-8 px-6 py-2 bg-slate-800/50 border border-slate-700/30 rounded-xl`}
            activeOpacity={0.7}
          >
            <Text style={tw`text-slate-400 font-semibold text-xs uppercase tracking-wide`}>
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
