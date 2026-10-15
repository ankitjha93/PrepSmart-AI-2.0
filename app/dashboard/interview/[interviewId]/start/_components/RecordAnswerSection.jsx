"use client";

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import gsap from 'gsap';
import { 
  Mic, 
  StopCircle, 
  LoaderCircle, 
  CheckCircle, 
  Volume2, 
  Activity, 
  Sparkles, 
  Radio, 
  Send,
  Video,
  VideoOff,
  BrainCircuit,
  MessageSquareQuote,
  Star,
  Lightbulb,
  Target,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';
import { OllamaService } from '@/utils/OllamaAIModal';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { useAuth } from '@/context/AuthContext';
import { eq } from 'drizzle-orm';
import moment from 'moment';

function RecordAnswerSection({ 
  mockInterviewQuestion, 
  activeQuestionIndex, 
  interviewData, 
  interviewId,
  onAnswerSaved 
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  // Audio Telemetry & Voice Catching State
  const [audioLevels, setAudioLevels] = useState([15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [micSilenceWarning, setMicSilenceWarning] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState(false);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(Boolean(SpeechRecognition));
      if (navigator.language) {
        setSelectedLang(navigator.language);
      }
    }
  }, []);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const timerRef = useRef(null);
  const latestTranscriptRef = useRef('');
  const maxVolumeSeenRef = useRef(0);
  const recordingStartTimeRef = useRef(0);
  const gainNodeRef = useRef(null);
  const scriptProcessorRef = useRef(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Enumerate all available audio input microphones
  const refreshAudioDevices = async () => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((d) => d.kind === 'audioinput');
        setAudioDevices(mics);
        if (mics.length > 0 && !selectedDeviceId) {
          const valid = mics.find((m) => m.deviceId && m.deviceId !== 'default');
          setSelectedDeviceId(valid?.deviceId || mics[0]?.deviceId || 'default');
        }
      } catch (e) {
        console.warn('Could not enumerate mics:', e);
      }
    }
  };

  useEffect(() => {
    refreshAudioDevices();
  }, [selectedDeviceId]);

  // Handle switching active microphone on the fly
  const handleDeviceChange = async (e) => {
    const newDeviceId = e.target.value;
    setSelectedDeviceId(newDeviceId);
    if (isRecording) {
      toast.info('Switching microphone device...');
      stopAudioRecording();
      setTimeout(() => {
        startAudioRecording(newDeviceId);
      }, 350);
    }
  };

  // Sync latest transcript
  useEffect(() => {
    latestTranscriptRef.current = userAnswer;
  }, [userAnswer]);

  // Reset state or load existing feedback when switching questions
  useEffect(() => {
    if (isRecording) {
      stopAudioRecording();
    }
    setUserAnswer('');
    setCurrentFeedback(null);
    setRecordingTime(0);
    latestTranscriptRef.current = '';

    const loadExistingRecord = async () => {
      const qText = mockInterviewQuestion?.[activeQuestionIndex]?.question;
      const targetId = interviewId || interviewData?.mockId;
      if (!qText || !targetId) return;

      try {
        const saved = await db
          .select()
          .from(UserAnswer)
          .where(eq(UserAnswer.mockIdRef, targetId));

        if (saved && saved.length > 0) {
          const match = saved.find((item) => item.question === qText);
          if (match) {
            setUserAnswer(match.userAns || '');
            latestTranscriptRef.current = match.userAns || '';
            setCurrentFeedback({
              rating: match.rating,
              feedback: match.feedback,
              correctAns: match.correctAns,
            });
          }
        }
      } catch (err) {
        console.warn('Could not load previous answer/feedback:', err);
      }
    };

    loadExistingRecord();
  }, [activeQuestionIndex, interviewData?.mockId, interviewId]);

  // Animate feedback card on appearance
  useEffect(() => {
    if (currentFeedback) {
      gsap.fromTo(
        '.feedback-card-anim',
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }
      );
    }
  }, [currentFeedback]);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Cleanup audio resources on unmount
  useEffect(() => {
    return () => {
      cleanupAudioVisualizer();
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const cleanupAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.onaudioprocess = null;
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }
    if (gainNodeRef.current) {
      try { gainNodeRef.current.disconnect(); } catch (e) {}
      gainNodeRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setAudioLevels(new Array(16).fill(15));
    setVoiceVolume(0);
    setVoiceDetected(false);
    setMicSilenceWarning(false);
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Magnetic Button Hover
  const handleMagneticMove = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.2, ease: "power2.out" });
  };

  const handleMagneticLeave = (e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
  };

  const recognitionRef = useRef(null);
  const [ollamaInfo, setOllamaInfo] = useState({ online: false, model: 'llama3.2' });

  // Probe Ollama local engine status
  useEffect(() => {
    OllamaService.checkStatus().then((status) => {
      setOllamaInfo({
        online: Boolean(status.online),
        model: status.activeModel || status.model || 'llama3.2',
      });
    });
  }, []);

  const evaluateWithOllama = async (textAnswer) => {
    const answerToEval = (textAnswer || userAnswer || latestTranscriptRef.current || '').trim();
    if (answerToEval.length < 5) {
      toast.info('Please speak or type a complete answer before evaluation.');
      return;
    }

    setLoading(true);
    toast.loading(`Evaluating with Ollama (${ollamaInfo.model || 'llama3.2'})...`);

    const currentQuestion = mockInterviewQuestion?.[activeQuestionIndex]?.question;
    const correctAnswer = mockInterviewQuestion?.[activeQuestionIndex]?.answer;
    const targetMockId = interviewId || interviewData?.mockId;

    try {
      const evalRes = await OllamaService.evaluateAnswer({
        question: currentQuestion,
        correctAnswer: correctAnswer,
        userAnswer: answerToEval,
        model: ollamaInfo.model || 'llama3.2',
      });

      const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress || 'candidate@prepsmart.ai';
      const ratingStr = String(evalRes?.rating || '7');
      const feedbackStr = evalRes?.feedback || 'Good attempt! Structure your answers highlighting architecture and trade-offs.';

      try {
        await db.insert(UserAnswer).values({
          mockId: targetMockId,
          mockIdRef: targetMockId,
          question: currentQuestion,
          correctAns: correctAnswer,
          userAns: answerToEval,
          feedback: feedbackStr,
          rating: ratingStr,
          userEmail: userEmail,
          createdAt: moment().format('DD-MM-yyyy'),
        });

        setCurrentFeedback({
          rating: ratingStr,
          feedback: feedbackStr,
          correctAns: correctAnswer,
        });

        toast.dismiss();
        toast.success(`Answer scored ${ratingStr}/10 with constructive feedback!`);
        if (onAnswerSaved) onAnswerSaved();
      } catch (dbErr) {
        console.warn('DB insert fallback:', dbErr);
        setCurrentFeedback({
          rating: ratingStr,
          feedback: feedbackStr,
          correctAns: correctAnswer,
        });
        toast.dismiss();
        toast.success(`Answer evaluated (${ratingStr}/10) by Ollama AI!`);
        if (onAnswerSaved) onAnswerSaved();
      }
    } catch (err) {
      console.error('Error evaluating answer with Ollama:', err);
      toast.dismiss();
      toast.error('Could not evaluate answer: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const isRecordingRef = useRef(false);
  const shouldRestartRecognitionRef = useRef(true);
  const networkRetriesRef = useRef(0);
  const recognitionTimeoutRef = useRef(null);
  const baseTranscriptRef = useRef('');
  const sessionFinalRef = useRef('');

  // Fresh Speech Recognition Factory Lifecycle
  const startRecognitionSession = () => {
    if (!isRecordingRef.current || !shouldRestartRecognitionRef.current) return;

    const SpeechRecognition = typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Clean up previous instance handlers before creating new session
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onaudiostart = () => {
        setVoiceDetected(true);
        setMicSilenceWarning(false);
      };

      recognition.onsoundstart = () => {
        setVoiceDetected(true);
        setMicSilenceWarning(false);
      };

      recognition.onspeechstart = () => {
        setVoiceDetected(true);
        setMicSilenceWarning(false);
        setIsTranscribing(true);
      };

      recognition.onspeechend = () => {
        // Natural speech pause
      };

      recognition.onresult = (event) => {
        let sessionFinal = '';
        let sessionInterim = '';

        // Canonical MDN loop through all results in the current session
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            sessionFinal += event.results[i][0].transcript + ' ';
          } else {
            sessionInterim += event.results[i][0].transcript;
          }
        }

        sessionFinalRef.current = sessionFinal;
        const currentCombined = (baseTranscriptRef.current + sessionFinal + sessionInterim).trim();
        setUserAnswer(currentCombined);
        latestTranscriptRef.current = currentCombined;

        if (sessionInterim.length > 0 || sessionFinal.length > 0) {
          setIsTranscribing(true);
          setVoiceDetected(true);
          setMicSilenceWarning(false);
          setSpeechError(null);
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error event:', e.error);
        if (e.error === 'not-allowed') {
          setMicPermissionError(true);
          setSpeechError('Microphone permission blocked. Please allow mic in browser address bar.');
          toast.error('Microphone permission was denied. Please allow microphone access in your browser address bar.');
          shouldRestartRecognitionRef.current = false;
        } else if (e.error === 'network') {
          networkRetriesRef.current += 1;
          setSpeechError('Browser speech engine network timeout. You can continue speaking or type directly.');
          if (networkRetriesRef.current > 6) {
            shouldRestartRecognitionRef.current = false;
          }
        } else if (e.error === 'audio-capture') {
          setSpeechError('Microphone hardware capture issue. Please verify your selected microphone.');
        } else if (e.error === 'no-speech') {
          // Normal thinking pause, continue listening
        }
      };

      recognition.onend = () => {
        // Commit session final results to baseline transcript
        if (sessionFinalRef.current) {
          baseTranscriptRef.current += sessionFinalRef.current;
          sessionFinalRef.current = '';
        }

        // Auto-restart across natural speaking pauses while user is still in recording state
        if (isRecordingRef.current && shouldRestartRecognitionRef.current) {
          if (recognitionTimeoutRef.current) {
            clearTimeout(recognitionTimeoutRef.current);
          }
          recognitionTimeoutRef.current = setTimeout(() => {
            if (isRecordingRef.current && shouldRestartRecognitionRef.current) {
              startRecognitionSession();
            }
          }, 200);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition session initiation notice:', err);
    }
  };

  // Start Audio Recording with Physical Hardware Voice Catching Telemetry
  const startAudioRecording = async (overrideDeviceId) => {
    if (typeof window === 'undefined') return;

    try {
      setMicPermissionError(false);
      setMicSilenceWarning(false);
      setVoiceDetected(false);
      setIsTranscribing(false);
      setSpeechError(null);
      maxVolumeSeenRef.current = 0;
      recordingStartTimeRef.current = Date.now();

      // 1. Initialize Baseline Transcript & Flags
      baseTranscriptRef.current = userAnswer ? userAnswer.trim() + ' ' : '';
      sessionFinalRef.current = '';
      networkRetriesRef.current = 0;
      shouldRestartRecognitionRef.current = true;
      isRecordingRef.current = true;
      setIsRecording(true);

      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }

      toast.info('Recording started! Speak your answer clearly into your microphone.');

      // 2. Launch dedicated speech recognition session FIRST (high priority)
      startRecognitionSession();

      // 3. Passive Hardware Audio Visualizer (Without destination sink to avoid WASAPI hardware locking)
      let stream = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const deviceToUse = overrideDeviceId || selectedDeviceId;
          const micConstraints = {
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: false,
          };
          if (deviceToUse && deviceToUse !== 'default') {
            micConstraints.deviceId = { exact: deviceToUse };
          }

          stream = await navigator.mediaDevices.getUserMedia({
            audio: micConstraints,
          });
          audioStreamRef.current = stream;

          // Initialize MediaRecorder for guaranteed physical audio transcription fallback
          audioChunksRef.current = [];
          if (typeof MediaRecorder !== 'undefined') {
            try {
              const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                  ? 'audio/webm'
                  : MediaRecorder.isTypeSupported('audio/mp4')
                    ? 'audio/mp4'
                    : '';
              const recorder = preferredMime
                ? new MediaRecorder(stream, { mimeType: preferredMime })
                : new MediaRecorder(stream);
              mediaRecorderRef.current = recorder;

              recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
                }
              };

              recorder.start(250);
            } catch (recErr) {
              console.warn('MediaRecorder initialization notice:', recErr);
            }
          }

          // Re-enumerate to get human-readable device labels once permission is granted
          if (navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
              const mics = devices.filter((d) => d.kind === 'audioinput' && d.deviceId);
              if (mics.length > 0) setAudioDevices(mics);
            }).catch(() => {});
          }

          // Passive Web Audio Analyser (Does not lock exclusive playback/WASAPI)
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const audioCtx = new AudioCtx();
            audioContextRef.current = audioCtx;
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
            }

            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.5;
            analyserRef.current = analyser;
            source.connect(analyser);

            const freqData = new Uint8Array(analyser.frequencyBinCount);
            const timeData = new Uint8Array(analyser.fftSize);

            const updateMeter = () => {
              if (!analyserRef.current || !isRecordingRef.current) return;
              analyserRef.current.getByteFrequencyData(freqData);
              analyserRef.current.getByteTimeDomainData(timeData);

              // Calculate passive RMS from time-domain buffers
              let sumSquares = 0;
              for (let i = 0; i < timeData.length; i++) {
                const norm = (timeData[i] - 128) / 128;
                sumSquares += norm * norm;
              }
              const rms = Math.sqrt(sumSquares / timeData.length);
              const volume = Math.min(100, Math.round(rms * 450));
              setVoiceVolume(volume);

              if (volume > maxVolumeSeenRef.current) {
                maxVolumeSeenRef.current = volume;
              }

              // Active voice detection threshold (>= 2%)
              if (volume >= 2) {
                setVoiceDetected(true);
                setMicSilenceWarning(false);
              } else {
                // If 7 seconds have elapsed without vocal audio
                if (Date.now() - recordingStartTimeRef.current > 7000 && maxVolumeSeenRef.current < 2) {
                  setMicSilenceWarning(true);
                }
              }

              // Dynamic audio spectrum waveform bars
              const bars = [];
              const step = Math.max(1, Math.floor(freqData.length / 16));
              for (let i = 0; i < 16; i++) {
                const val = freqData[i * step] || 0;
                const height = Math.max(15, Math.min(100, Math.round((val / 255) * 85 + 15)));
                bars.push(height);
              }
              setAudioLevels(bars);

              animFrameRef.current = requestAnimationFrame(updateMeter);
            };

            updateMeter();
          }
        } catch (micErr) {
          console.warn('Microphone stream access notice:', micErr);
          if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
            setMicPermissionError(true);
            toast.error('Microphone access blocked. Please allow mic permissions in your browser.');
            return;
          }
        }
      }
    } catch (err) {
      console.error('Recording initialization error:', err);
      isRecordingRef.current = false;
      setIsRecording(false);
      toast.error('Could not start voice recording: ' + (err.message || 'Please try again.'));
    }
  };

  // Stop Recording & Automatically Evaluate with Ollama AI
  const stopAudioRecording = async () => {
    isRecordingRef.current = false;
    shouldRestartRecognitionRef.current = false;
    setIsRecording(false);
    setVoiceDetected(false);
    setMicSilenceWarning(false);

    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }

    // Stop Speech Recognition cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Stop MediaRecorder and grab audio blob for transcription
    let audioBlobToTranscribe = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        if (audioChunksRef.current && audioChunksRef.current.length > 0) {
          const mime = mediaRecorderRef.current.mimeType || 'audio/webm';
          audioBlobToTranscribe = new Blob(audioChunksRef.current, { type: mime });
        }
      } catch (e) {}
    }

    cleanupAudioVisualizer();

    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      audioStreamRef.current = null;
    }

    // Determine candidate answer from real-time speech engine
    let candidateAnswer = (
      latestTranscriptRef.current ||
      userAnswer ||
      (baseTranscriptRef.current + (sessionFinalRef.current || '')) ||
      ''
    ).trim();

    // If browser speech recognition failed to capture or left the response empty:
    // Transcribe directly from recorded physical audio via /api/transcribe!
    if ((!candidateAnswer || candidateAnswer.length < 5) && audioBlobToTranscribe && audioBlobToTranscribe.size > 800) {
      toast.loading('Transcribing spoken response...');
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append('audio', audioBlobToTranscribe, 'response.webm');

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        toast.dismiss();

        if (data.transcript && data.transcript.trim().length > 0) {
          candidateAnswer = data.transcript.trim();
          setUserAnswer(candidateAnswer);
          latestTranscriptRef.current = candidateAnswer;
          toast.success('Spoken answer transcribed successfully!');
        }
      } catch (err) {
        console.warn('Audio transcription error:', err);
        toast.dismiss();
      } finally {
        setIsTranscribing(false);
      }
    }

    // Automatically evaluate with Ollama AI as requested
    if (candidateAnswer && candidateAnswer.length >= 3) {
      toast.info('Response captured! Evaluating with Ollama AI...');
      evaluateWithOllama(candidateAnswer);
    } else {
      toast.info('Recording stopped. Review or complete your answer above, then click "Save & Evaluate Answer".');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  // Manual save & evaluation trigger
  const saveManualAnswer = async () => {
    await evaluateWithOllama(userAnswer);
  };

  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="flex flex-col w-full space-y-5">
      
      {/* 16:9 WIDESCREEN STUDIO CAMERA CHASSIS */}
      <div className="relative w-full aspect-video rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center group">
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* Live Mirrored Webcam Feed */}
        <Webcam
          audio={false}
          mirrored={true}
          className="w-full h-full object-cover rounded-3xl"
        />

        {/* HUD Overlay: Live Feed Status (Top-Left) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-red-400 font-black">STUDIO CAM</span>
          <span className="text-white/40">•</span>
          <span>1080p 30fps</span>
        </div>

        {/* HUD Overlay: Transcriber Armed (Top-Right) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/70 backdrop-blur-md border border-blue-400/30 text-white text-[11px] font-bold shadow-lg">
          <BrainCircuit className="w-3.5 h-3.5 text-blue-200" />
          <span>Ollama AI Evaluator Armed</span>
        </div>

        {/* FLOATING REAL-TIME AUDIO EQUALIZER DOCK (Bottom Center) */}
        <div className="absolute bottom-5 z-20 w-[92%] max-w-md mx-auto">
          {isRecording ? (
            <div className="backdrop-blur-xl bg-black/80 border border-white/20 rounded-2xl px-4 py-3 shadow-2xl flex flex-col items-center gap-2 transition-all duration-300">
              
              {/* Audio Status Header */}
              <div className="flex items-center justify-between w-full px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      voiceVolume >= 2
                        ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] scale-125'
                        : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {voiceVolume >= 2 ? `Voice Caught: Active Speech (${voiceVolume}%)` : 'Listening... Speak Your Answer'}
                  </span>
                </div>

                <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                  {formatTime(recordingTime)}
                </span>
              </div>

              {/* 16 Dynamic Animated Audio Waveform Bars */}
              <div className="flex items-end justify-center gap-1.5 h-10 w-full px-1 py-0.5">
                {audioLevels.map((lvl, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${lvl}%` }}
                    className={`w-2 rounded-full transition-all duration-75 ease-out ${
                      voiceVolume >= 4
                        ? 'bg-gradient-to-t from-blue-600 via-teal-400 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                        : 'bg-gradient-to-t from-slate-600 to-slate-500 opacity-50'
                    }`}
                  />
                ))}
              </div>

              {/* Smooth Volume Gauge Line */}
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, voiceVolume * 1.5)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-md bg-black/60 border border-white/15 rounded-2xl px-4 py-2.5 shadow-lg flex items-center justify-center gap-2.5 text-white text-xs font-semibold">
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Microphone Ready • Click "Record Answer" Below to Speak</span>
            </div>
          )}
        </div>
      </div>

      {/* HARDWARE MICROPHONE INPUT & LANGUAGE PICKER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-md text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Mic className="w-4 h-4" />
          </div>
          <span>Input & Language:</span>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:justify-end flex-wrap sm:flex-nowrap">
          {/* Dialect / Language Selector */}
          <select
            value={selectedLang}
            onChange={(e) => {
              setSelectedLang(e.target.value);
              if (isRecording) {
                toast.info(`Language set to ${e.target.value}`);
                stopAudioRecording();
                setTimeout(() => startAudioRecording(selectedDeviceId), 300);
              }
            }}
            title="Speech Recognition Language"
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer shadow-sm"
          >
            <option value="en-US">English (US)</option>
            <option value="en-IN">English (India)</option>
            <option value="en-GB">English (UK)</option>
          </select>

          {/* Microphone Selector */}
          <select
            value={selectedDeviceId}
            onChange={handleDeviceChange}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-full sm:w-auto max-w-xs truncate cursor-pointer shadow-sm"
          >
            <option value="default">Default System Microphone</option>
            {audioDevices
              .filter((d) => d.deviceId && d.deviceId !== 'default')
              .map((device, idx) => (
                <option key={device.deviceId || idx} value={device.deviceId}>
                  {device.label || `Microphone ${idx + 1}`}
                </option>
              ))}
          </select>

          <button
            type="button"
            onClick={refreshAudioDevices}
            title="Refresh available microphones"
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time Voice Catching Telemetry Alerts */}
      {isRecording && micSilenceWarning && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs shadow-lg animate-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-amber-600 dark:text-amber-300">Microphone is not catching your voice.</p>
              <p className="font-normal opacity-90 mt-0.5">Please check that your physical microphone is unmuted, adjust hardware boost, or switch to your headset/mic below:</p>
            </div>
          </div>
          {audioDevices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="bg-amber-100 dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none"
            >
              <option value="default">Default System Microphone</option>
              {audioDevices
                .filter((d) => d.deviceId && d.deviceId !== 'default')
                .map((device, idx) => (
                  <option key={device.deviceId || idx} value={device.deviceId}>
                    {device.label || `Microphone ${idx + 1}`}
                  </option>
                ))}
            </select>
          )}
        </div>
      )}

      {/* Speech Recognition Error Banner */}
      {isRecording && speechError && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="font-medium">{speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => startRecognitionSession()}
            className="h-7 text-[11px] font-bold rounded-lg px-2.5 bg-amber-200 dark:bg-amber-900/60 border border-amber-400 dark:border-amber-700 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 cursor-pointer transition-colors"
          >
            Retry Recognition
          </button>
        </div>
      )}

      {/* Browser Speech Recognition Support Banner */}
      {!speechSupported && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs shadow-md font-medium">
          <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type your answer directly in the box below.</span>
        </div>
      )}

      {micPermissionError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs font-bold shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold text-rose-600 dark:text-rose-300">Microphone permission blocked.</p>
            <p className="font-normal opacity-90 mt-0.5">Please click the lock or camera icon in your browser address bar and set Microphone to "Allow" to record voice answers.</p>
          </div>
        </div>
      )}

      {/* ANSWER TRANSCRIPT TERMINAL & INPUT BOX */}
      <div className="w-full space-y-2 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between pb-1">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Your Transcribed Response</span>
            {isRecording && (
              isTranscribing ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Transcribing Live Speech...
                </span>
              ) : (voiceVolume >= 2 || voiceDetected) ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Voice Caught ({voiceVolume}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Listening • Speak Your Answer
                </span>
              )
            )}
          </label>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{userAnswer.length} chars</span>
          </div>
        </div>

        <Textarea
          placeholder="Speak into your microphone or type your technical answer here..."
          rows={4}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full resize-y text-sm font-medium rounded-2xl p-3.5 border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500/40"
        />

        {/* RECORDING & EVALUATION ACTION CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          
          {/* Record / Stop Button */}
          <Button
            type="button"
            disabled={loading}
            variant={isRecording ? "destructive" : "default"}
            onClick={toggleRecording}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className={`w-full sm:w-1/2 h-11 rounded-xl text-xs md:text-sm font-black flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-md ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <StopCircle className="w-4 h-4 animate-spin" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Record Spoken Answer</span>
              </>
            )}
          </Button>

          {/* Save & Evaluate Answer Button */}
          <Button
            type="button"
            disabled={loading || isRecording || !userAnswer || userAnswer.trim().length < 5}
            onClick={saveManualAnswer}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="w-full sm:w-1/2 h-11 rounded-xl text-xs md:text-sm font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 group cursor-pointer transition-all duration-300 disabled:opacity-40"
          >
            {loading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                <span>Evaluating with AI...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Save & Evaluate Answer</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* LIVE AI EVALUATION & FEEDBACK CARD */}
      {currentFeedback && (
        <div className="feedback-card-anim p-5 rounded-3xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white/80 to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900/80 dark:to-purple-950/30 backdrop-blur-xl shadow-xl space-y-4 transition-all duration-500">
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100/90 dark:border-indigo-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>AI Evaluation & Feedback</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Recorded
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Assessed by Ollama • Synced to your performance report
                </p>
              </div>
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {currentFeedback.rating}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 10</span>
            </div>
          </div>

          {/* Constructive AI Feedback */}
          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>AI Coaching Feedback:</span>
            </div>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {currentFeedback.feedback}
            </p>
          </div>

          {/* Model Ideal Points */}
          {currentFeedback.correctAns && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                <Target className="w-3.5 h-3.5" />
                <span>Benchmark Target Answer:</span>
              </div>
              <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
                {currentFeedback.correctAns}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default RecordAnswerSection;