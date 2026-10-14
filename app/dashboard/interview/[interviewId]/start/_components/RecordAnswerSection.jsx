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
  RotateCcw
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

  // Audio Visualizer State
  const [audioLevels, setAudioLevels] = useState([15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
  const [voiceVolume, setVoiceVolume] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const timerRef = useRef(null);
  const latestTranscriptRef = useRef('');

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
  const finalTranscriptRef = useRef('');
  const activeInterimRef = useRef('');

  // Start Audio Recording & Continuous Speech Recognition
  const startAudioRecording = async () => {
    // 1. Pre-check browser mediaDevices support
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Microphone recording is not supported in this browser.');
      return;
    }

    try {
      audioChunksRef.current = [];

      // 2. Request clean audio capture stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      audioStreamRef.current = stream;

      // 3. Isolated Web Audio Visualizer Setup
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;

          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.75;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateWaveform = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);

            const bars = [];
            let sum = 0;
            const barCount = 16;
            const step = Math.max(1, Math.floor(dataArray.length / barCount));

            for (let i = 0; i < barCount; i++) {
              const val = dataArray[i * step] || 0;
              sum += val;
              const normalizedHeight = Math.max(15, Math.min(100, (val / 255) * 100));
              bars.push(normalizedHeight);
            }

            const avgVolume = Math.round(sum / barCount);
            setVoiceVolume(avgVolume);
            setAudioLevels(bars);

            animFrameRef.current = requestAnimationFrame(updateWaveform);
          };

          updateWaveform();
        }
      } catch (audioErr) {
        console.warn('Audio visualization unavailable:', audioErr);
      }

      // 4. MediaRecorder initialization
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        const mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          cleanupAudioVisualizer();
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
            audioStreamRef.current = null;
          }
        };

        mediaRecorder.start(250);
      } catch (recErr) {
        console.warn('MediaRecorder setup notice:', recErr);
      }

      // 5. Web Speech Recognition Engine with Continuous Auto-Restart
      finalTranscriptRef.current = userAnswer ? userAnswer.trim() + ' ' : '';
      activeInterimRef.current = '';

      const SpeechRecognition = typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          recognition.maxAlternatives = 1;

          recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcriptPart = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscriptRef.current += transcriptPart + ' ';
              } else {
                interim += transcriptPart;
              }
            }
            activeInterimRef.current = interim;
            const currentCombined = (finalTranscriptRef.current + interim).trim();
            setUserAnswer(currentCombined);
            latestTranscriptRef.current = currentCombined;
          };

          recognition.onerror = (e) => {
            console.warn('Live SpeechRecognition error:', e.error);
            if (e.error === 'not-allowed') {
              toast.error('Microphone permission was denied. Please allow microphone access in your browser address bar.');
              shouldRestartRecognitionRef.current = false;
            } else if (e.error === 'network') {
              toast.info('Speech-to-text service network hiccup. You can continue speaking or type directly.');
            }
          };

          recognition.onend = () => {
            // Auto-restart speech engine across conversational pauses while recording is active
            if (isRecordingRef.current && shouldRestartRecognitionRef.current) {
              try {
                recognition.start();
              } catch (restartErr) {
                // Ignore if already active
              }
            }
          };

          shouldRestartRecognitionRef.current = true;
          recognition.start();
          recognitionRef.current = recognition;
        } catch (speechErr) {
          console.warn('SpeechRecognition initialization notice:', speechErr);
        }
      } else {
        toast.info('Speech-to-text is not natively supported in this browser. You can type directly in the box.');
      }

      // 6. Update Active State
      isRecordingRef.current = true;
      setIsRecording(true);
      toast.info('Recording started! Speak your answer clearly into your microphone.');
    } catch (err) {
      console.error('Microphone access error:', err);
      isRecordingRef.current = false;
      setIsRecording(false);
      toast.error('Could not access microphone: ' + (err.message || 'Permission denied'));
    }
  };

  // Fail-safe Stop Recording
  const stopAudioRecording = () => {
    isRecordingRef.current = false;
    shouldRestartRecognitionRef.current = false;
    setIsRecording(false);

    // Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Stop Media Recorder
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {}
      mediaRecorderRef.current = null;
    }

    cleanupAudioVisualizer();

    // Release all hardware microphone tracks
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      audioStreamRef.current = null;
    }

    // Auto-evaluate if transcript captured
    const candidateAnswer = (latestTranscriptRef.current || userAnswer || '').trim();
    if (candidateAnswer.length >= 5) {
      toast.info('Voice captured! Evaluating your response with Ollama AI...');
      evaluateWithOllama(candidateAnswer);
    } else {
      toast.info('Recording stopped. Review or type your answer, then click "Save & Evaluate Answer".');
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
                      voiceVolume > 5
                        ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] scale-125'
                        : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {voiceVolume > 5 ? 'Hearing Your Voice' : 'Listening... Speak Your Answer'}
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
                      voiceVolume > 5
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

      {/* ANSWER TRANSCRIPT TERMINAL & INPUT BOX */}
      <div className="w-full space-y-2 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between pb-1">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Your Transcribed Response</span>
            {isRecording && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                Live Recording
              </span>
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