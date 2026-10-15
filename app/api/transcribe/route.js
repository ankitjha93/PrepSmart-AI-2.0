import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const MODEL_CANDIDATES = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio');

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If file is too small (under 1KB, likely silence/empty)
    if (buffer.length < 1000) {
      return NextResponse.json({ transcript: '' });
    }

    const base64Audio = buffer.toString('base64');
    const rawMimeType = file.type || 'audio/webm';
    const cleanMimeType = rawMimeType.split(';')[0] || 'audio/webm';

    if (!genAI) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    let transcript = '';
    let lastError = null;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: base64Audio,
            },
          },
          "Please transcribe this candidate's spoken technical interview response verbatim. Return ONLY the transcribed text, nothing else. Do not add quotes, introductory phrases, or markdown explanations. If no discernible speech or only silence/background noise is heard, return an empty string.",
        ]);

        transcript = result.response.text().trim();
        if (transcript) break;
      } catch (err) {
        console.warn(`Model ${modelName} audio transcription notice:`, err.message);
        lastError = err;
      }
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Audio transcription route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
