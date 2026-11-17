"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type VoiceRecorderStatus = "idle" | "recording" | "done";
export type VoiceRecorderError = "unsupported" | "denied";

// TS dom lib에 Web Speech API 타입이 없어 쓰는 부분만 선언한다
type SpeechRecognitionResultLike = { isFinal: boolean; 0: { transcript: string } };
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionConstructor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function isSupported() {
  return (
    typeof MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    !!getSpeechRecognition()
  );
}

const subscribeNothing = () => () => {};

type UseVoiceRecorderOptions = { maxSeconds?: number };

// 녹음(MediaRecorder)과 음성 인식(Web Speech API)을 함께 돌려 파일과 자막을 만든다. UI와 무관하게 재사용한다
export function useVoiceRecorder({ maxSeconds = 30 }: UseVoiceRecorderOptions = {}) {
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const [denied, setDenied] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(maxSeconds);
  // 서버 렌더에서는 true로 두어 하이드레이션 불일치를 피한다
  const supported = useSyncExternalStore(subscribeNothing, isSupported, () => true);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const finalTextRef = useRef("");
  const timerRef = useRef<number | undefined>(undefined);
  const speakingTimerRef = useRef<number | undefined>(undefined);
  const keepListeningRef = useRef(false);
  // 마이크 권한을 기다리는 동안 reset·언마운트되면 그 시작을 무효로 만든다
  const startTokenRef = useRef(0);

  const clearSpeaking = () => {
    window.clearTimeout(speakingTimerRef.current);
    setIsSpeaking(false);
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  // 결과를 남기지 않고 녹음·인식을 모두 끊는다
  const discard = useCallback(() => {
    startTokenRef.current += 1;
    window.clearInterval(timerRef.current);
    clearSpeaking();
    keepListeningRef.current = false;
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.abort();
    }
    recognitionRef.current = null;
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.onstop = null;
      if (recorder.state !== "inactive") recorder.stop();
    }
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }, []);

  // 정지하면 인식 중이던 마지막 문장까지 받은 뒤 recorder의 onstop에서 완료로 넘어간다
  const stop = useCallback(() => {
    window.clearInterval(timerRef.current);
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  const reset = useCallback(() => {
    discard();
    setStatus("idle");
    setDenied(false);
    setTranscript("");
    setInterim("");
    setBlob(null);
    setRemainingSeconds(maxSeconds);
  }, [discard, maxSeconds]);

  const start = useCallback(async () => {
    const Recognition = getSpeechRecognition();
    if (!supported || !Recognition) return;
    discard();
    const token = startTokenRef.current;
    setDenied(false);
    finalTextRef.current = "";
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      if (token === startTokenRef.current) setDenied(true);
      return;
    }
    if (token !== startTokenRef.current) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    streamRef.current = stream;
    // 마이크 권한·초기화를 기다리는 동안 done 화면이 비어 보이지 않도록 스트림을 받은 뒤에 비운다
    setBlob(null);
    setTranscript("");
    setInterim("");
    setRemainingSeconds(maxSeconds);

    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = event => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: recorder.mimeType }));
      setInterim("");
      clearSpeaking();
      setStatus("done");
      stopTracks();
    };

    const recognition = new Recognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = event => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalTextRef.current += ` ${result[0].transcript}`;
        else interimText += ` ${result[0].transcript}`;
      }
      setTranscript(finalTextRef.current.trim());
      setInterim(interimText.trim());
      // 결과가 이어지는 동안만 true — 잠시 결과가 끊기면 말을 멈춘 것으로 본다
      setIsSpeaking(true);
      window.clearTimeout(speakingTimerRef.current);
      speakingTimerRef.current = window.setTimeout(() => setIsSpeaking(false), 800);
    };
    // 브라우저는 침묵이 이어지면 인식을 스스로 끝내므로 녹음 중이면 다시 시작한다
    recognition.onend = () => {
      if (keepListeningRef.current) recognition.start();
    };

    recorderRef.current = recorder;
    recognitionRef.current = recognition;
    keepListeningRef.current = true;
    recorder.start();
    recognition.start();
    setStatus("recording");

    let left = maxSeconds;
    timerRef.current = window.setInterval(() => {
      left -= 1;
      setRemainingSeconds(left);
      if (left <= 0) stop();
    }, 1000);
  }, [supported, maxSeconds, discard, stop]);

  useEffect(() => discard, [discard]);

  const error: VoiceRecorderError | null = !supported ? "unsupported" : denied ? "denied" : null;

  return {
    status,
    error,
    transcript,
    interim,
    isSpeaking,
    blob,
    remainingSeconds,
    start,
    stop,
    reset,
  };
}
