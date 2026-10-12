"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Mic, StopCircle, LoaderCircle, CheckCircle, Volume2, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModal'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useAuth } from '@/context/AuthContext'
import moment from 'moment'

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewData }) {
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
                setRecordingTime(prev => prev + 1);
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
                audioStreamRef.current.getTracks().forEach(track => track.stop());
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
                analyser.fftSize = 64; // 32 frequency bins
                analyser.smoothingTimeConstant = 0.75;
                analyserRef.current = analyser;

                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const updateWaveform = () => {
                    analyser.getByteFrequencyData(dataArray);

                    // Sample 16 frequency bands
                    const bars = [];
                    let sum = 0;
                    const barCount = 16;
                    const step = Math.max(1, Math.floor(dataArray.length / barCount));

                    for (let i = 0; i < barCount; i++) {
                        const val = dataArray[i * step] || 0;
                        sum += val;
                        // Min height 14%, max 100%
                        const pct = Math.min(100, Math.max(14, Math.round((val / 255) * 100)));
                        bars.push(pct);
                    }

                    const avgVolume = Math.round((sum / (barCount * 255)) * 100);
                    setAudioLevels(bars);
                    setVoiceVolume(avgVolume);

                    animFrameRef.current = requestAnimationFrame(updateWaveform);
                };

                updateWaveform();
            } catch (audioErr) {
                console.warn('AudioContext visualizer not supported or failed:', audioErr);
            }

            // Determine supported audio mime type
            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                mimeType = 'audio/ogg';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                cleanupAudioVisualizer();
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                
                // Stop audio tracks
                if (audioStreamRef.current) {
                    audioStreamRef.current.getTracks().forEach(track => track.stop());
                }

                if (audioBlob.size > 1000) {
                    await processAudioWithGemini(audioBlob, mimeType);
                } else {
                    toast.error('Recording was too short. Please speak for at least a few seconds.');
                }
            };

            mediaRecorder.start(250); // Collect in slices
            setIsRecording(true);
            toast.info('Listening! Your voice waveform is active below.');
        } catch (err) {
            console.error('Error starting MediaRecorder:', err);
            toast.error('Microphone access denied. Please click the camera/mic icon in your address bar and allow permissions.');
            setIsRecording(false);
            cleanupAudioVisualizer();
        }
    };

    const stopAudioRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        cleanupAudioVisualizer();
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopAudioRecording();
        } else {
            startAudioRecording();
        }
    };

    // Convert Blob to Base64
    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                resolve(base64data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Process recorded audio using Gemini
    const processAudioWithGemini = async (audioBlob, mimeType) => {
        setLoading(true);
        toast.info('Analyzing and transcribing your voice with Gemini AI...');

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
                        data: base64Audio
                    }
                },
                prompt
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
                    createdAt: moment().format('DD-MM-yyyy')
                });

                if (resp) {
                    toast.success('Spoken answer transcribed and AI feedback saved successfully!');
                }
            } catch (dbErr) {
                console.warn('DB insert fallback:', dbErr);
                toast.success('Spoken answer transcribed & evaluated by Gemini AI!');
            }
        } catch (err) {
            console.error('Error processing audio with Gemini:', err);
            toast.error('Could not process audio: ' + (err.message || 'Please try again or type your answer below.'));
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
                    createdAt: moment().format('DD-MM-yyyy')
                });

                if (resp) {
                    toast.success('Answer and AI feedback saved successfully!');
                }
            } catch (dbErr) {
                console.warn('DB insert fallback:', dbErr);
                toast.success('Answer evaluated by Gemini AI!');
            }
        } catch (err) {
            console.error('Error saving manual answer:', err);
            toast.error('Failed to save answer: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex items-center justify-center flex-col w-full'>
            {/* Webcam Container with Modern Floating Visualizer Overlay */}
            <div className='flex flex-col mt-4 justify-center items-center bg-black rounded-xl p-5 relative w-full max-w-lg shadow-xl border border-gray-800 overflow-hidden'>
                <Image 
                    src={'/webcam.png'} 
                    width={180} 
                    height={180} 
                    alt="Webcam placeholder"
                    className='absolute opacity-80'
                />
                <Webcam
                    mirrored={true}
                    style={{
                        height: 320,
                        width: '100%',
                        zIndex: 10,
                        borderRadius: 12
                    }}
                />

                {/* Floating Modern Voice Indicator Dock */}
                <div className='absolute bottom-8 z-20 w-[90%] max-w-md mx-auto'>
                    {isRecording ? (
                        <div className='backdrop-blur-md bg-black/75 border border-white/20 rounded-2xl px-4 py-3 shadow-2xl flex flex-col items-center gap-2 transition-all duration-300'>
                            {/* Status Header */}
                            <div className='flex items-center justify-between w-full px-2'>
                                <div className='flex items-center gap-2'>
                                    <span className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                                        voiceVolume > 5 
                                            ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] scale-125' 
                                            : 'bg-amber-400 animate-pulse'
                                    }`} />
                                    <span className='text-xs font-semibold text-white tracking-wide'>
                                        {voiceVolume > 5 ? 'Hearing Your Voice' : 'Listening... Speak Now'}
                                    </span>
                                </div>
                                <span className='text-xs font-mono text-white/80 bg-white/10 px-2 py-0.5 rounded-md'>
                                    {formatTime(recordingTime)}
                                </span>
                            </div>

                            {/* 16 Dynamic Animated Audio Waveform Bars */}
                            <div className='flex items-end justify-center gap-1.5 h-10 w-full px-2 py-1'>
                                {audioLevels.map((lvl, idx) => (
                                    <div
                                        key={idx}
                                        style={{ height: `${lvl}%` }}
                                        className={`w-2 rounded-full transition-all duration-75 ease-out ${
                                            voiceVolume > 5
                                                ? 'bg-gradient-to-t from-[#2563EB] via-teal-400 to-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                                                : 'bg-gradient-to-t from-slate-600 to-slate-500 opacity-50'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Volume meter bar */}
                            <div className='w-full bg-white/10 h-1 rounded-full overflow-hidden'>
                                <div 
                                    className='h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-75'
                                    style={{ width: `${Math.min(100, voiceVolume * 1.5)}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='backdrop-blur-md bg-black/60 border border-white/15 rounded-xl px-4 py-2 shadow-lg flex items-center justify-center gap-2.5 text-white/90 text-xs font-medium'>
                            <Activity className='w-4 h-4 text-primary animate-pulse' />
                            <span>Microphone Ready • Click Record to Speak</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Answer Display & Input Box */}
            <div className='w-full max-w-lg mt-4'>
                <div className='flex justify-between items-center mb-1'>
                    <label className='font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                        Your Answer
                        {isRecording && (
                            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 animate-pulse'>
                                <span className='w-2 h-2 rounded-full bg-red-600'></span>
                                Live Recording
                            </span>
                        )}
                    </label>
                    <span className='text-xs text-muted-foreground'>
                        {userAnswer.length} characters
                    </span>
                </div>
                <Textarea 
                    placeholder="Click 'Record Answer' to speak your answer, or type directly here..."
                    rows={4}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className='w-full resize-y text-sm rounded-xl'
                />
            </div>

            {/* Controls */}
            <div className='flex gap-4 my-5 items-center justify-center'>
                <Button 
                    type="button"
                    disabled={loading}
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={toggleRecording}
                    className='min-w-[180px] shadow-sm'
                >
                    {isRecording ? (
                        <span className='flex gap-2 items-center'>
                            <StopCircle className='animate-pulse' /> Stop Recording
                        </span>
                    ) : (
                        <span className='text-primary flex gap-2 items-center'>
                            <Mic /> Record Answer
                        </span>
                    )}
                </Button>

                {/* Save Manually typed / edited answer */}
                <Button 
                    type="button"
                    disabled={loading || isRecording || !userAnswer || userAnswer.trim().length < 5}
                    onClick={saveManualAnswer}
                    className='bg-primary text-white flex gap-2 items-center shadow-sm'
                >
                    {loading ? (
                        <>
                            <LoaderCircle className='animate-spin' /> Processing with AI...
                        </>
                    ) : (
                        <>
                            <CheckCircle className='w-4 h-4' /> Save Answer
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

export default RecordAnswerSection