import { useCallback, useRef } from "react";

export function useBrowserAudio() {
  const webAudioCtxRef = useRef<AudioContext | null>(null);
  const webStreamRef = useRef<MediaStream | null>(null);
  const webProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const stopBrowserAudio = useCallback(() => {
    if (webProcessorRef.current) {
      try {
        webProcessorRef.current.disconnect();
      } catch {
        // ignore
      }
      webProcessorRef.current = null;
    }
    if (webStreamRef.current) {
      try {
        for (const track of webStreamRef.current.getTracks()) {
          track.stop();
        }
      } catch {
        // ignore
      }
      webStreamRef.current = null;
    }
    if (webAudioCtxRef.current) {
      try {
        webAudioCtxRef.current.close();
      } catch {
        // ignore
      }
      webAudioCtxRef.current = null;
    }
  }, []);

  const startBrowserAudio = useCallback(
    async (socket: WebSocket | null, onAudioChunk: (chunk: string) => void) => {
      // 1. Get microphone audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      webStreamRef.current = stream;

      // 2. Create audio context targeting 16000Hz (same as player)
      // biome-ignore lint/suspicious/noExplicitAny: webkitAudioContext support
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      webAudioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      // 3. Create script processor node (2048 buffer size, 1 input channel, 1 output channel)
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      webProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0); // Float32Array

        // Convert Float32Array [-1.0, 1.0] to Int16 PCM [-32768, 32767]
        const pcmBuffer = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1.0, Math.min(1.0, inputData[i]));
          pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert Int16 array buffer to base64 string
        const bytes = new Uint8Array(pcmBuffer.buffer);
        let binary = "";
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Chunk = window.btoa(binary);

        // Stream raw base64 PCM over WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
          onAudioChunk(base64Chunk);
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    },
    [],
  );

  return {
    startBrowserAudio,
    stopBrowserAudio,
  };
}
