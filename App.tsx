import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import BottomNavBar from "./src/components/BottomNavBar";
import HiddenRecorder from "./src/components/HiddenRecorder";
import { useTransmitterConnection } from "./src/hooks/useTransmitterConnection";
import AboutScreen from "./src/screens/AboutScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import SplashScreen from "./src/screens/SplashScreen";
import TransmitterScreen from "./src/screens/TransmitterScreen";
import type { ConnectionHistoryItem } from "./src/types";
import { parseQrCode } from "./src/utils/qr";
import { clearHistory as clearStorageHistory, loadHistory } from "./src/utils/storage";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "loading" | "transmitter" | "history" | "about"
  >("loading");
  const [history, setHistory] = useState<ConnectionHistoryItem[]>([]);

  // QR Code Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  const {
    serverIp,
    setServerIp,
    serverPort,
    setServerPort,
    connectionStatus,
    isStreaming,
    isScanning,
    scanProgress,
    cameraPermission,
    requestCameraPermission,
    startAutoDiscovery,
    connectToServer,
    handleConnectionToggle,
    handleStreamingToggle,
    handleAudioDataReceived,
    handleStreamingStatusChanged,
    handleRecorderError,
    webViewRef,
  } = useTransmitterConnection(setHistory);

  // Load connection history & handle auto-reconnect on boot
  useEffect(() => {
    async function initializeApp() {
      // 1. Load history log
      const savedHistory = await loadHistory();
      setHistory(savedHistory);

      let lastUsedItem: ConnectionHistoryItem | null = null;
      if (savedHistory.length > 0) {
        lastUsedItem = savedHistory[0];
        setServerIp(lastUsedItem.ip);
        setServerPort(lastUsedItem.port);
      }

      // 2. Show splashscreen logo for 1.5s
      setTimeout(() => {
        setCurrentScreen("transmitter");

        // 3. Trigger auto-reconnect if last item exists
        if (lastUsedItem) {
          connectToServer(lastUsedItem.ip, lastUsedItem.port);
        }
      }, 1500);
    }
    initializeApp();
  }, [connectToServer, setServerIp, setServerPort]);

  // QR Barcode scanner scanned callback
  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      setScanned(true);
      const parsed = parseQrCode(data);
      if (parsed) {
        setServerIp(parsed.ip);
        setServerPort(parsed.port);
        setShowScanner(false);
        setTimeout(() => {
          connectToServer(parsed.ip, parsed.port);
        }, 300);
      } else {
        Alert.alert("Erro", "Formato de IP inválido no QR Code.");
        setScanned(false);
      }
    },
    [connectToServer, setServerIp, setServerPort],
  );

  const startQrScan = useCallback(async () => {
    setScanned(false);
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          "Permissão Negada",
          "Precisamos de permissão da câmera para ler o QR Code do receptor.",
        );
        return;
      }
    }
    setShowScanner(true);
  }, [cameraPermission, requestCameraPermission]);

  // Handle direct connection select from History list
  const handleHistoryItemSelect = useCallback(
    (ip: string, port: string) => {
      setServerIp(ip);
      setServerPort(port);
      setCurrentScreen("transmitter");
      // Connect immediately
      connectToServer(ip, port);
    },
    [connectToServer, setServerIp, setServerPort],
  );

  // Handle clearing history
  const handleClearHistory = useCallback(async () => {
    await clearStorageHistory();
    setHistory([]);
    Alert.alert("Histórico Limpo", "Seu log de conexões recentes foi apagado.");
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }} edges={["top", "bottom"]}>
        <View style={{ flex: 1, backgroundColor: "#020617" }}>
          {currentScreen === "loading" ? (
            <SplashScreen />
          ) : (
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                {currentScreen === "transmitter" ? (
                  <TransmitterScreen
                    serverIp={serverIp}
                    setServerIp={setServerIp}
                    serverPort={serverPort}
                    setServerPort={setServerPort}
                    connectionStatus={connectionStatus}
                    isStreaming={isStreaming}
                    isScanning={isScanning}
                    scanProgress={scanProgress}
                    showScanner={showScanner}
                    setShowScanner={setShowScanner}
                    scanned={scanned}
                    cameraPermission={cameraPermission}
                    requestCameraPermission={requestCameraPermission}
                    handleBarcodeScanned={handleBarcodeScanned}
                    startQrScan={startQrScan}
                    startAutoDiscovery={startAutoDiscovery}
                    handleConnectionToggle={handleConnectionToggle}
                    handleStreamingToggle={handleStreamingToggle}
                  />
                ) : currentScreen === "history" ? (
                  <HistoryScreen
                    history={history}
                    onSelect={handleHistoryItemSelect}
                    onClear={handleClearHistory}
                    onBack={() => setCurrentScreen("transmitter")}
                  />
                ) : (
                  <AboutScreen onBack={() => setCurrentScreen("transmitter")} />
                )}
              </View>

              <BottomNavBar
                currentScreen={currentScreen}
                onScreenChange={(screen) => setCurrentScreen(screen)}
              />
            </View>
          )}

          <View style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}>
            <HiddenRecorder
              webViewRef={webViewRef}
              onAudioData={handleAudioDataReceived}
              onStreamingStatusChange={handleStreamingStatusChanged}
              onError={handleRecorderError}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
