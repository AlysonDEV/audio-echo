import type React from "react";
import { Platform } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

// HTML5 Web Audio API recorder code loaded in WKWebView/WebView locally
const RECORDER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Audio Recorder</title>
</head>
<body>
  <script>
    let audioContext;
    let processor;
    let mediaStream;

    window.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'start') {
          await startRecording();
        } else if (msg.type === 'stop') {
          stopRecording();
        }
      } catch (err) {
        sendToRN({ type: 'error', message: 'Failed to process RN message: ' + err.message });
      }
    });

    function sendToRN(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    async function startRecording() {
      try {
        // Request microphone permission inside WebView
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        
        // Create AudioContext targeting 16000Hz (same as player)
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass({ sampleRate: 16000 });
        
        const source = audioContext.createMediaStreamSource(mediaStream);
        
        // 2048 buffer size, 1 input channel, 1 output channel
        processor = audioContext.createScriptProcessor(2048, 1, 1);
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0); // Float32Array [-1.0, 1.0]
          
          // Convert to 16-bit PCM [-32768, 32767]
          const pcmBuffer = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1.0, Math.min(1.0, inputData[i]));
            pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          
          // Convert to base64
          const bytes = new Uint8Array(pcmBuffer.buffer);
          let binary = "";
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Chunk = btoa(binary);
          
          // Post back to React Native
          sendToRN({ type: 'data', chunk: base64Chunk });
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
        
        sendToRN({ type: 'status', status: 'streaming' });
      } catch (err) {
        sendToRN({ type: 'error', message: 'Mic access error in WebView: ' + err.message });
      }
    }

    function stopRecording() {
      try {
        if (processor) {
          processor.disconnect();
          processor = null;
        }
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          mediaStream = null;
        }
        if (audioContext) {
          audioContext.close();
          audioContext = null;
        }
        sendToRN({ type: 'status', status: 'stopped' });
      } catch (err) {
        sendToRN({ type: 'error', message: 'Stop recording error in WebView: ' + err.message });
      }
    }
  </script>
</body>
</html>
`;

interface HiddenRecorderProps {
  webViewRef: React.RefObject<WebView | null>;
  onAudioData: (base64Chunk: string) => void;
  onStreamingStatusChange: (isStreaming: boolean) => void;
  onError: (message: string) => void;
}

export default function HiddenRecorder({
  webViewRef,
  onAudioData,
  onStreamingStatusChange,
  onError,
}: HiddenRecorderProps) {
  function handleWebViewMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "data") {
        onAudioData(data.chunk);
      } else if (data.type === "status") {
        if (data.status === "streaming") {
          onStreamingStatusChange(true);
        } else if (data.status === "stopped") {
          onStreamingStatusChange(false);
        }
      } else if (data.type === "error") {
        onError(data.message);
      }
    } catch (err) {
      console.error("WebView postMessage parse error:", err);
    }
  }

  if (Platform.OS === "web") {
    return null;
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ html: RECORDER_HTML, baseUrl: "https://localhost" }}
      originWhitelist={["*"]}
      onMessage={handleWebViewMessage}
      style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback={true}
    />
  );
}
