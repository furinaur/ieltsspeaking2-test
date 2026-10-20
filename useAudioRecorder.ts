import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioBase64: string | null;
  transcript: string;
  setTranscript: (val: string | ((prev: string) => string)) => void;
  audioLevel: number;
  hasPermission: boolean | null;
  permissionError: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<{ blob: Blob; base64: string } | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  loadAudioFile: (file: File) => Promise<void>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  const setupSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let interimTranscript = '';
        recognition.onresult = (event: any) => {
          let currentFinal = '';
          interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const piece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentFinal += piece + ' ';
            } else {
              interimTranscript += piece;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => (prev ? prev.trim() + ' ' + currentFinal.trim() : currentFinal.trim()));
          }
        };

        recognition.onerror = (e: any) => {
          // Non-blocking error, log only
          console.warn('Speech recognition notice:', e.error);
        };

        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition initialization error:', err);
      }
    }
  }, []);

  useEffect(() => {
    setupSpeechRecognition();
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (_) {}
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setupSpeechRecognition]);

  // Audio level visualizer loop
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isRecording || isPaused) {
      setAudioLevel(0);
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    // Normalized 0 to 100
    const normalized = Math.min(100, Math.round((avg / 128) * 100));
    setAudioLevel(normalized);

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, [isRecording, isPaused]);

  const startRecording = async (): Promise<boolean> => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Determine supported mime type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Set up AudioContext for level visualization
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        updateAudioLevel();
      }

      mediaRecorder.start(250); // timeslice every 250ms
      setIsRecording(true);
      setIsPaused(false);

      // Start speech recognition if available
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch (_) {}
      }

      return true;
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setHasPermission(false);
      setPermissionError(err.message || 'Microphone access denied. You can still type your transcript manually.');
      return false;
    }
  };

  const stopRecording = (): Promise<{ blob: Blob; base64: string } | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevel(0);

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAudioBase64(base64);
          setIsRecording(false);
          setIsPaused(false);

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
          }

          resolve({ blob, base64 });
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current.stop();
    });
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      updateAudioLevel();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch (_) {}
      }
    }
  };

  const resetRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
    setIsPaused(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setTranscript('');
    setAudioLevel(0);
  };

  const loadAudioFile = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl(url);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAudioBase64(reader.result as string);
        resolve();
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    audioBase64,
    transcript,
    setTranscript,
    audioLevel,
    hasPermission,
    permissionError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    loadAudioFile,
  };
}
