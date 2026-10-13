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
  MessageSquareQuote
} from 'lucide-react';
import { toast } from 'sonner';
import { chatSession } from '@/utils/GeminiAIModal';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { useAuth } from '@/context/AuthContext';
import moment from 'moment';

function RecordAnswerSection({ 
  mockInterviewQuestion, 
  activeQuestionIndex, 
  interviewData, 
  onAnswerSaved 
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Audio Visualizer State
  const [audioLevels, setAudioLevels] = useState([15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
  const [voiceVolume, setVoiceVolume] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const timerRef = useRef(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Reset state when switching questions
  useEffect(() => {
    if (isRecording) {
      stopAudioRecording();
    }
    setUserAnswer('');
    setRecordingTime(0);
  }, [activeQuestionIndex]);

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

  const startAudioRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Setup Real-time Web Audio Analyser for Voice Visualization
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
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
          analyser.getByteFrequencyData(dataArray);

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
      } catch (audioErr) {
        console.warn('Audio visualization unavailable:', audioErr);
      }

      // Check supported MIME types for recording
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        cleanupAudioVisualizer();

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        if (audioBlob.size > 1000) {
          await processAudioWithGemini(audioBlob, mimeType);
        } else {
          toast.error('Audio recording was too short. Please try again.');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Microphone recording started. Speak your answer clearly.');
    } catch (err) {
      console.error('Microphone access error:', err);
      toast.error('Could not access microphone: ' + (err.message || 'Permission denied'));
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processAudioWithGemini = async (audioBlob, mimeType) => {
    setLoading(true);
    toast.loading('Processing audio with Gemini 3.5 AI...');

    try {
      const base64Audio = await blobToBase64(audioBlob);
      const currentQuestion = mockInterviewQuestion?.[activeQuestionIndex]?.question;
      const correctAnswer = mockInterviewQuestion?.[activeQuestionIndex]?.answer;

      const prompt = `You are an expert AI interviewer evaluating a candidate's spoken response.
Interview Question: "${currentQuestion}"
Target Answer / Key Concepts: "${correctAnswer}"

Listen carefully to the candidate's audio answer and respond strictly in valid JSON format:
{
  "userAns": "The full transcribed text of what the candidate said in the audio",
  "rating": "Rating from 1 to 10 evaluating technical accuracy, completeness, and delivery",
  "feedback": "Constructive feedback and specific areas for improvement in 3 to 5 concise sentences"
}`;

      const baseMime = mimeType.split(';')[0];
      const result = await chatSession.sendMessage([
        {
          inlineData: {
            mimeType: baseMime,
            data: base64Audio,
          },
        },
        prompt,
      ]);

      const rawText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);

      if (parsed?.userAns) {
        setUserAnswer(parsed.userAns);
      }

      // Save to database
      const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress || 'candidate@prepsmart.ai';
      try {
        const resp = await db.insert(UserAnswer).values({
          mockIdRef: interviewData?.mockId,
          question: currentQuestion,
          correctAns: correctAnswer,
          userAns: parsed?.userAns || 'Audio Answer',
          feedback: parsed?.feedback || 'Good effort.',
          rating: String(parsed?.rating || '7'),
          userEmail: userEmail,
          createdAt: moment().format('DD-MM-yyyy'),
        });

        if (resp) {
          toast.dismiss();
          toast.success('Spoken answer transcribed & AI feedback saved!');
          if (onAnswerSaved) onAnswerSaved();
        }
      } catch (dbErr) {
        console.warn('DB insert fallback:', dbErr);
        toast.dismiss();
        toast.success('Spoken answer transcribed & evaluated by Gemini AI!');
        if (onAnswerSaved) onAnswerSaved();
      }
    } catch (err) {
      console.error('Error processing audio with Gemini:', err);
      toast.dismiss();
      toast.error('Could not process audio: ' + (err.message || 'Please try again or edit below.'));
    } finally {
      setLoading(false);
    }
  };

  // Fallback for manually typed / edited answers
  const saveManualAnswer = async () => {
    if (!userAnswer || userAnswer.trim().length < 5) {
      toast.error('Please enter an answer before saving.');
      return;
    }

    setLoading(true);
    const currentQuestion = mockInterviewQuestion?.[activeQuestionIndex]?.question;
    const correctAnswer = mockInterviewQuestion?.[activeQuestionIndex]?.answer;

    const prompt = `Question: "${currentQuestion}", User Answer: "${userAnswer}". ` +
      `Based on the interview question and the user's answer, provide a rating (from 1 to 10) and concise constructive feedback (3-5 lines) on areas of improvement in valid JSON format with keys "rating" and "feedback".`;

    try {
      const result = await chatSession.sendMessage(prompt);
      const rawText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);

      const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress || 'candidate@prepsmart.ai';
      try {
        const resp = await db.insert(UserAnswer).values({
          mockIdRef: interviewData?.mockId,
          question: currentQuestion,
          correctAns: correctAnswer,
          userAns: userAnswer,
          feedback: parsed?.feedback,
          rating: String(parsed?.rating),
          userEmail: userEmail,
          createdAt: moment().format('DD-MM-yyyy'),
        });

        if (resp) {
          toast.success('Answer and AI evaluation saved successfully!');
          if (onAnswerSaved) onAnswerSaved();
        }
      } catch (dbErr) {
        console.warn('DB insert fallback:', dbErr);
        toast.success('Answer evaluated by Gemini AI!');
        if (onAnswerSaved) onAnswerSaved();
      }
    } catch (err) {
      console.error('Error saving manual answer:', err);
      toast.error('Failed to save answer: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
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
          <span>Gemini Speech AI Armed</span>
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

    </div>
  );
}

export default RecordAnswerSection;