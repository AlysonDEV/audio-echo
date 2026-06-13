import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import type { WebView } from "react-native-webview";

import type { ConnectionHistoryItem, ConnectionStatus } from "../types";
import { logErrorToServer } from "../utils/logger";
import { getDeviceIp, scanSubnet } from "../utils/network";
import { saveConnection } from "../utils/storage";
import { useBrowserAudio } from "./useBrowserAudio";

export function useTransmitterConnection(
  onHistoryUpdate: (history: ConnectionHistoryItem[]) => void,
) {
  const [serverIp, setServerIp] = useState("");
  const [serverPort, setServerPort] = useState("3001");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const socketRef = useRef<WebSocket | null>(null);
  const isStreamingRef = useRef(false);
  const webViewRef = useRef<WebView | null>(null);

  const serverIpRef = useRef(serverIp);
  const serverPortRef = useRef(serverPort);

  const { startBrowserAudio, stopBrowserAudio } = useBrowserAudio();

  useEffect(() => {
    serverIpRef.current = serverIp;
  }, [serverIp]);

  useEffect(() => {
    serverPortRef.current = serverPort;
  }, [serverPort]);

  const logError = useCallback((error: Error | string, isFatal = false) => {
    logErrorToServer(error, isFatal, serverIpRef.current, serverPortRef.current);
  }, []);

  const disconnectFromServer = useCallback(() => {
    if (Platform.OS === "web") {
      stopBrowserAudio();
      setIsStreaming(false);
      isStreamingRef.current = false;
    } else {
      try {
        webViewRef.current?.postMessage(JSON.stringify({ type: "stop" }));
      } catch (err) {
        logError(err instanceof Error ? err : String(err), false);
      }
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnectionStatus("disconnected");
  }, [stopBrowserAudio, logError]);

  const connectToServer = useCallback(
    async (targetIp = serverIp, targetPort = serverPort) => {
      setConnectionStatus("connecting");
      const wsUrl = `ws://${targetIp.trim()}:${targetPort.trim()}?clientType=phone`;

      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        const connectionTimeout = setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            socket.close();
            setConnectionStatus("disconnected");
            Alert.alert(
              "Erro de Conexão",
              "Não foi possível conectar ao servidor. Verifique o IP e se o computador está na mesma rede/VPN.",
            );
          }
        }, 5000);

        socket.onopen = () => {
          clearTimeout(connectionTimeout);
          setConnectionStatus("connected");
          saveConnection(targetIp, targetPort).then((updatedHistory) => {
            onHistoryUpdate(updatedHistory);
          });
        };

        socket.onclose = () => {
          clearTimeout(connectionTimeout);
          disconnectFromServer();
        };

        socket.onerror = (e) => {
          console.error("WebSocket error:", e);
          logError("WebSocket connection error", false);
        };
      } catch (error) {
        setConnectionStatus("disconnected");
        Alert.alert("Erro", "Houve uma falha ao tentar inicializar a conexão.");
        logError(error instanceof Error ? error : String(error), false);
      }
    },
    [serverIp, serverPort, onHistoryUpdate, disconnectFromServer, logError],
  );

  const connectToServerRef = useRef<
    ((targetIp?: string, targetPort?: string) => Promise<void>) | null
  >(null);
  useEffect(() => {
    connectToServerRef.current = connectToServer;
  });

  const startAutoDiscovery = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);

    try {
      const localIp = await getDeviceIp();
      console.log("Local Device IP:", localIp);

      if (!localIp || localIp === "0.0.0.0" || localIp === "127.0.0.1") {
        const commonSubnets = ["192.168.1", "192.168.0", "192.168.15", "10.0.0", "172.16.0"];
        for (const subnet of commonSubnets) {
          const foundIp = await scanSubnet(subnet, serverPort, setScanProgress);
          if (foundIp) {
            setServerIp(foundIp);
            setIsScanning(false);
            Alert.alert("Conectado", `Computador encontrado em: ${foundIp}`);
            connectToServerRef.current?.(foundIp, serverPort);
            return;
          }
        }
      } else {
        const ipParts = localIp.split(".");
        if (ipParts.length === 4) {
          const subnetBase = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
          const foundIp = await scanSubnet(subnetBase, serverPort, setScanProgress);
          if (foundIp) {
            setServerIp(foundIp);
            setIsScanning(false);
            Alert.alert("Encontrado", `Computador encontrado em: ${foundIp}`);
            connectToServerRef.current?.(foundIp, serverPort);
            return;
          }
        }
      }

      setIsScanning(false);
      Alert.alert(
        "Não Encontrado",
        "Nenhum computador executando o receptor foi encontrado na rede local automaticamente.",
      );
    } catch (err) {
      console.error("Auto discovery error:", err);
      setIsScanning(false);
      logError(err instanceof Error ? err : String(err), false);
      Alert.alert("Erro", "Houve uma falha ao tentar buscar o computador na rede.");
    }
  }, [serverPort, logError]);

  const handleConnectionToggle = useCallback(async () => {
    if (connectionStatus === "connected" || connectionStatus === "connecting") {
      disconnectFromServer();
    } else {
      if (!serverIp.trim()) {
        Alert.alert("Erro", "Por favor, insira o IP do computador.");
        return;
      }
      await connectToServer();
    }
  }, [connectionStatus, serverIp, connectToServer, disconnectFromServer]);

  const startBrowserStreaming = useCallback(async () => {
    try {
      await startBrowserAudio(socketRef.current, (base64Chunk) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(base64Chunk);
        }
      });
      setIsStreaming(true);
      isStreamingRef.current = true;
    } catch (err) {
      console.error("Browser mic access error:", err);
      Alert.alert(
        "Erro de Microfone",
        "Não foi possível acessar seu microfone no navegador. Permita o acesso ao microfone nas configurações da página.",
      );
      logError(err instanceof Error ? err : String(err), false);
    }
  }, [startBrowserAudio, logError]);

  const startNativeStreaming = useCallback(async () => {
    if (!micPermission?.granted) {
      const result = await requestMicPermission();
      if (!result.granted) {
        Alert.alert(
          "Permissão Negada",
          "Precisamos de permissão do microfone para transmitir seu áudio.",
        );
        return;
      }
    }

    try {
      webViewRef.current?.postMessage(JSON.stringify({ type: "start" }));
    } catch (err) {
      console.error("Failed to start WebView recording:", err);
      logError(err instanceof Error ? err : String(err), false);
    }
  }, [micPermission, requestMicPermission, logError]);

  const handleStreamingToggle = useCallback(async () => {
    if (connectionStatus !== "connected") {
      Alert.alert("Não Conectado", "Conecte-se ao computador antes de iniciar o microfone.");
      return;
    }

    if (isStreaming) {
      if (Platform.OS === "web") {
        stopBrowserAudio();
        setIsStreaming(false);
        isStreamingRef.current = false;
      } else {
        try {
          webViewRef.current?.postMessage(JSON.stringify({ type: "stop" }));
        } catch (err) {
          console.error("Failed to stop WebView recording:", err);
          logError(err instanceof Error ? err : String(err), false);
        }
      }
    } else {
      if (Platform.OS === "web") {
        await startBrowserStreaming();
      } else {
        await startNativeStreaming();
      }
    }
  }, [
    connectionStatus,
    isStreaming,
    stopBrowserAudio,
    startBrowserStreaming,
    startNativeStreaming,
    logError,
  ]);

  const handleAudioDataReceived = useCallback((base64Chunk: string) => {
    if (
      isStreamingRef.current &&
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(base64Chunk);
    }
  }, []);

  const handleStreamingStatusChanged = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
    isStreamingRef.current = streaming;
  }, []);

  const handleRecorderError = useCallback(
    (msg: string) => {
      console.warn("[RECORDER ERROR CALLBACK]", msg);
      logError(msg, false);
      Alert.alert("Erro de Gravação", "Ocorreu uma falha no gravador interno.");
      setIsStreaming(false);
      isStreamingRef.current = false;
    },
    [logError],
  );

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (Platform.OS === "web") {
        stopBrowserAudio();
      } else {
        webViewRef.current?.postMessage(JSON.stringify({ type: "stop" }));
      }
    };
  }, [stopBrowserAudio]);

  return {
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
    disconnectFromServer,
    handleConnectionToggle,
    handleStreamingToggle,
    handleAudioDataReceived,
    handleStreamingStatusChanged,
    handleRecorderError,
    webViewRef,
    logError,
  };
}
