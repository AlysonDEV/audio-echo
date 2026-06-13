import { CameraView, type PermissionResponse } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";
import type { ConnectionStatus } from "../types";

interface TransmitterScreenProps {
  serverIp: string;
  setServerIp: (ip: string) => void;
  serverPort: string;
  setServerPort: (port: string) => void;
  connectionStatus: ConnectionStatus;
  isStreaming: boolean;
  isScanning: boolean;
  scanProgress: number;

  // QR Scanner States
  showScanner: boolean;
  setShowScanner: (show: boolean) => void;
  scanned: boolean;
  cameraPermission: PermissionResponse | null;
  requestCameraPermission: () => Promise<PermissionResponse>;
  handleBarcodeScanned: (result: { data: string }) => void;
  startQrScan: () => void;

  startAutoDiscovery: () => void;
  handleConnectionToggle: () => void;
  handleStreamingToggle: () => void;
}

export default function TransmitterScreen({
  serverIp,
  setServerIp,
  serverPort,
  setServerPort,
  connectionStatus,
  isStreaming,
  isScanning,
  scanProgress,
  showScanner,
  setShowScanner,
  scanned,
  cameraPermission,
  requestCameraPermission,
  handleBarcodeScanned,
  startQrScan,
  startAutoDiscovery,
  handleConnectionToggle,
  handleStreamingToggle,
}: TransmitterScreenProps) {
  // If the QR scanner is open, show full-screen camera overlay
  if (showScanner) {
    return (
      <View style={tw`flex-1 bg-slate-950`}>
        <StatusBar style="light" />
        <View style={tw`flex-1 justify-between p-6`}>
          {/* Header */}
          <View style={tw`items-center mt-6`}>
            <Text style={tw`text-2xl font-bold text-slate-100`}>Escanear QR Code</Text>
            <Text style={tw`text-sm text-slate-400 mt-2 text-center px-4 leading-relaxed`}>
              Aponte a câmera para o QR Code de Conexão na tela do computador receptor
            </Text>
          </View>

          {/* Camera Scanner View */}
          <View
            style={tw`w-72 h-72 rounded-3xl overflow-hidden border border-teal-500/30 self-center bg-slate-900 justify-center items-center shadow-lg shadow-teal-500/5`}
          >
            {cameraPermission?.granted ? (
              <CameraView
                style={tw`w-full h-full`}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
              />
            ) : (
              <View style={tw`p-6 items-center`}>
                <Text style={tw`text-sm text-slate-400 text-center mb-5 leading-relaxed`}>
                  Precisamos de permissão de câmera para ler o QR Code do computador.
                </Text>
                <TouchableOpacity
                  onPress={requestCameraPermission}
                  style={tw`bg-teal-500 px-5 py-3 rounded-xl`}
                >
                  <Text style={tw`text-slate-950 font-bold text-xs`}>PERMITIR ACESSO</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Close Scanner Control */}
          <TouchableOpacity
            onPress={() => setShowScanner(false)}
            style={tw`w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl justify-center items-center mb-4`}
          >
            <Text style={tw`text-slate-300 font-semibold text-sm`}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-slate-950`}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        <ScrollView
          contentContainerStyle={[
            tw`px-6 pt-4 pb-8 flex-grow justify-center`,
            Platform.OS === "ios" ? { paddingTop: 30 } : null,
          ]}
          showsVerticalScrollIndicator={true}
        >
          <View style={tw`w-full max-w-md mx-auto`}>
            {/* Header */}
            <View style={tw`items-center mb-8`}>
              <View
                style={tw`w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 items-center justify-center mb-4`}
              >
                {/* Mic Icon */}
                <Text style={tw`text-2xl text-teal-400`}>🎙️</Text>
              </View>
              <Text style={tw`text-2xl font-bold text-slate-100`}>Microfone Móvel</Text>
              <Text style={tw`text-sm text-slate-400 mt-1`}>
                {Platform.OS === "web" ? "Navegador Transmissor" : "Estação Replay Transmissor"}
              </Text>
            </View>

            {/* Network Scanning Status Indicator */}
            {isScanning && (
              <View
                style={tw`bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4 mb-6 flex-row items-center justify-between`}
              >
                <View style={tw`flex-row items-center gap-3`}>
                  <ActivityIndicator size="small" color="#2dd4bf" />
                  <View>
                    <Text style={tw`text-sm font-semibold text-slate-200`}>
                      Buscando computador...
                    </Text>
                    <Text style={tw`text-xs text-slate-400`}>Escaneando rede local e VPNs...</Text>
                  </View>
                </View>
                <Text style={tw`text-sm font-mono text-teal-400 font-bold`}>{scanProgress}%</Text>
              </View>
            )}

            {/* Connection Settings Card */}
            <View style={tw`bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6`}>
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider`}>
                  Conexão
                </Text>
                <View style={tw`flex-row gap-3`}>
                  {Platform.OS !== "web" && (
                    <TouchableOpacity
                      onPress={startQrScan}
                      disabled={connectionStatus !== "disconnected"}
                      style={tw`${connectionStatus !== "disconnected" ? "opacity-40" : ""}`}
                    >
                      <Text style={tw`text-[10px] sm:text-xs text-teal-400 font-bold`}>
                        📷 QR CODE
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={startAutoDiscovery}
                    disabled={isScanning || connectionStatus !== "disconnected"}
                    style={tw`${isScanning || connectionStatus !== "disconnected" ? "opacity-40" : ""}`}
                  >
                    <Text style={tw`text-[10px] sm:text-xs text-teal-400 font-bold`}>
                      🔍 BUSCAR PC
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={tw`flex-row gap-2 mb-3`}>
                <View style={tw`flex-2`}>
                  <TextInput
                    placeholder="IP do Computador (ex: 192.168.1.50)"
                    placeholderTextColor="#64748b"
                    value={serverIp}
                    onChangeText={setServerIp}
                    keyboardType="numeric"
                    editable={connectionStatus === "disconnected"}
                    style={tw`w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm`}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <TextInput
                    placeholder="Porta"
                    placeholderTextColor="#64748b"
                    value={serverPort}
                    onChangeText={setServerPort}
                    keyboardType="numeric"
                    editable={connectionStatus === "disconnected"}
                    style={tw`w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-3 text-sm text-center`}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleConnectionToggle}
                style={tw`w-full py-3.5 rounded-xl justify-center items-center ${
                  connectionStatus === "connected"
                    ? "bg-rose-600/20 border border-rose-500/30"
                    : connectionStatus === "connecting"
                      ? "bg-teal-500/20 border border-teal-500/30"
                      : "bg-teal-500"
                }`}
              >
                {connectionStatus === "connecting" ? (
                  <View style={tw`flex-row items-center`}>
                    <ActivityIndicator size="small" color="#2dd4bf" style={tw`mr-2`} />
                    <Text style={tw`text-teal-400 font-semibold text-sm`}>Conectando...</Text>
                  </View>
                ) : (
                  <Text
                    style={tw`font-semibold text-sm ${
                      connectionStatus === "connected"
                        ? "text-rose-400"
                        : "text-slate-950 font-bold"
                    }`}
                  >
                    {connectionStatus === "connected" ? "DESCONECTAR" : "CONECTAR"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Transmitter Controls */}
            <View style={tw`bg-slate-900 border border-slate-800 rounded-2xl p-6 items-center`}>
              {/* Status Text */}
              <View style={tw`flex-row items-center gap-2 mb-6`}>
                <View
                  style={tw`w-2 h-2 rounded-full ${isStreaming ? "bg-emerald-500" : "bg-slate-600"}`}
                />
                <Text style={tw`text-xs text-slate-400 uppercase font-semibold`}>
                  {isStreaming ? "MICROFONE ATIVO" : "MICROFONE MUDO"}
                </Text>
              </View>

              {/* Glowing Neon Toggle Button */}
              <TouchableOpacity
                onPress={handleStreamingToggle}
                disabled={connectionStatus !== "connected"}
                style={tw`w-36 h-36 rounded-full justify-center items-center border border-slate-800 ${
                  connectionStatus !== "connected"
                    ? "bg-slate-950 opacity-40"
                    : isStreaming
                      ? "bg-emerald-500/10 border-emerald-400 shadow-lg"
                      : "bg-slate-950 border-slate-700"
                }`}
              >
                <View
                  style={tw`w-28 h-28 rounded-full justify-center items-center ${
                    isStreaming ? "bg-emerald-500 shadow-md" : "bg-slate-800"
                  }`}
                >
                  <Text style={tw`text-4xl`}>{isStreaming ? "🎙️" : "🔇"}</Text>
                </View>
              </TouchableOpacity>

              <Text style={tw`text-xs text-slate-500 mt-6 text-center leading-relaxed px-4`}>
                {connectionStatus !== "connected"
                  ? "Conecte-se ao computador para habilitar o botão do microfone."
                  : isStreaming
                    ? "Seu áudio está sendo transmitido. Fale perto do celular."
                    : "Toque no botão acima para iniciar a transmissão."}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
