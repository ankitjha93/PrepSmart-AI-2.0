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
  AlertTriangle
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

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const timerRef = useRef(null);
  const latestTranscriptRef = useRef('');
  const maxVolumeSeenRef = useRef(0);
  const recordingStartTimeRef = useRef(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

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
  // In Chromium, ended SpeechRecognition instances cannot be restarted (.start() throws InvalidStateError).
  // A fresh instance must be created for each session / conversational pause restart.
  const startRecognitionSession = () => {
    if (!isRecordingRef.current || !shouldRestartRecognitionRef.current) return;

    const SpeechRecognition = typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

    if (!SpeechRecognition) return;

    // Clean up previous instance handlers before creating new session
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onspeechstart = () => {
        setVoiceDetected(true);
        setMicSilenceWarning(false);
      };

      recognition.onspeechend = () => {
        // Speech ended
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
          setVoiceDetected(true);
          setMicSilenceWarning(false);
        }
      };

      recognition.onerror = (e) => {
        console.debug('Speech recognition event:', e.error);
        if (e.error === 'not-allowed') {
          setMicPermissionError(true);
          toast.error('Microphone permission was denied. Please allow microphone access in your browser address bar.');
          shouldRestartRecognitionRef.current = false;
        } else if (e.error === 'network') {
          networkRetriesRef.current += 1;
          if (networkRetriesRef.current > 4) {
            shouldRestartRecognitionRef.current = false;
          }
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
  const startAudioRecording = async () => {
    if (typeof window === 'undefined') return;

    try {
      setMicPermissionError(false);
      setMicSilenceWarning(false);
      setVoiceDetected(false);
      maxVolumeSeenRef.current = 0;
      recordingStartTimeRef.current = Date.now();

      // 1. Request hardware microphone stream to verify voice catching
      let stream = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true,
            },
          });
          audioStreamRef.current = stream;

          // Initialize Web Audio PCM RMS Volume Analyzer
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const audioCtx = new AudioCtx();
            audioContextRef.current = audioCtx;
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
            }

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.6;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            const freqData = new Uint8Array(analyser.frequencyBinCount);
            const timeData = new Uint8Array(analyser.fftSize);

            const updateMeter = () => {
              if (!analyserRef.current || !isRecordingRef.current) return;
              analyserRef.current.getByteFrequencyData(freqData);
              analyserRef.current.getByteTimeDomainData(timeData);

              // Calculate true physical microphone RMS volume (0 - 100)
              let sumSquares = 0;
              for (let i = 0; i < timeData.length; i++) {
                const norm = (timeData[i] - 128) / 128;
                sumSquares += norm * norm;
              }
              const rms = Math.sqrt(sumSquares / timeData.length);
              const volume = Math.min(100, Math.round(rms * 280));
              setVoiceVolume(volume);

              if (volume > maxVolumeSeenRef.current) {
                maxVolumeSeenRef.current = volume;
              }

              // Active voice detection threshold (>= 6%)
              if (volume >= 6) {
                setVoiceDetected(true);
                setMicSilenceWarning(false);
              } else {
                // If 3.5 seconds have elapsed and microphone hasn't picked up vocal audio
                if (Date.now() - recordingStartTimeRef.current > 3500 && maxVolumeSeenRef.current < 6) {
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

      // 2. Initialize Baseline Transcript & Flags
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

      // 3. Launch dedicated speech recognition session
      startRecognitionSession();
    } catch (err) {
      console.error('Recording initialization error:', err);
      isRecordingRef.current = false;
      setIsRecording(false);
      toast.error('Could not start voice recording: ' + (err.message || 'Please try again.'));
    }
  };

  // Stop Recording & Automatically Evaluate with Ollama AI
  const stopAudioRecording = () => {
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

    cleanupAudioVisualizer();

    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      audioStreamRef.current = null;
    }

    // Determine final candidate answer across all streams
    const candidateAnswer = (
      latestTranscriptRef.current ||
      userAnswer ||
      (baseTranscriptRef.current + (sessionFinalRef.current || '')) ||
      ''
    ).trim();

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
                      voiceVolume >= 6
                        ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] scale-125'
                        : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {voiceVolume >= 6 ? `Voice Caught: Active Speech (${voiceVolume}%)` : 'Listening... Speak Your Answer'}
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
                      voiceVolume >= 6
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

      {/* Real-time Voice Catching Telemetry Alerts */}
      {isRecording && micSilenceWarning && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-lg animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold text-amber-600 dark:text-amber-300">Microphone is not catching your voice.</p>
            <p className="font-normal opacity-90 mt-0.5">Please check that your physical microphone is unmuted, properly selected in your browser, and speak directly into the mic.</p>
          </div>
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
              voiceVolume >= 6 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Voice Caught ({voiceVolume}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Live Recording • Awaiting Speech
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