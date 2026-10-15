import { NextResponse } from 'next/server';
import { WaveFile } from 'wavefile';
import { pipeline } from '@xenova/transformers';

export const dynamic = 'force-dynamic';

let transcriberInstance = null;
let transcriberPromise = null;

async function getTranscriber() {
  if (transcriberInstance) return transcriberInstance;
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const p = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
      transcriberInstance = p;
      return p;
    })();
  }
  return await transcriberPromise;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio');

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If audio payload is empty or too small to contain speech
    if (buffer.length < 500) {
      return NextResponse.json({ transcript: '' });
    }

    let audioData = null;

    try {
      const wav = new WaveFile(buffer);
      wav.toBitDepth('32f');
      wav.toSampleRate(16000);
      let samples = wav.getSamples();

      if (Array.isArray(samples)) {
        if (samples.length > 1) {
          const SCALING_FACTOR = Math.sqrt(2);
          const mono = new Float32Array(samples[0].length);
          for (let i = 0; i < samples[0].length; ++i) {
            mono[i] = (SCALING_FACTOR * (samples[0][i] + samples[1][i])) / 2;
          }
          audioData = mono;
        } else {
          audioData = samples[0];
        }
      } else {
        audioData = samples;
      }
    } catch (parseErr) {
      console.warn('WAV parser fallback notice:', parseErr.message);
    }

    if (!audioData || audioData.length === 0) {
      return NextResponse.json({
        transcript: '',
        notice: 'Could not extract audio samples or audio format unsupported',
      });
    }

    const transcriber = await getTranscriber();
    const result = await transcriber(audioData, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: false,
    });

    let rawTranscript = (result?.text || '').trim();

    // Clean up common silence hallucinations from whisper
    const cleaned = rawTranscript
      .replace(/^\[.*?\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // If it's a known non-speech whisper artifact on silent audio
    const isHallucination = /^(you|thank you|thanks for watching|subscribe|bye)\.?$/i.test(cleaned);
    const finalTranscript = isHallucination ? '' : cleaned;

    return NextResponse.json({
      success: true,
      transcript: finalTranscript,
    });
  } catch (error) {
    console.error('Local speech transcription route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
