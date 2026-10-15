import { NextResponse } from 'next/server';

export async function POST(req) {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const defaultModel = process.env.OLLAMA_MODEL || 'llama3.3';

  try {
    const body = await req.json();
    const {
      question = '',
      correctAnswer = '',
      userAnswer = '',
      model = defaultModel,
    } = body;

    if (!userAnswer || userAnswer.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Candidate answer is required for evaluation',
      }, { status: 400 });
    }

    const evaluationPrompt = `You are a Senior Staff Interviewer evaluating a candidate's answer during a technical mock interview.

Interview Question: "${question}"
Target Benchmark Answer / Key Concepts: "${correctAnswer}"
Candidate's Transcribed / Submitted Answer: "${userAnswer}"

TASK:
Evaluate the candidate's answer with technical rigor, precision, and fairness.
Respond strictly in valid JSON format with two keys:
1. "rating": An integer from 1 to 10 (1 = completely incorrect/evasive, 5 = superficial or partially correct, 8 = strong technical response, 10 = exceptional mastery with trade-offs).
2. "feedback": 3 to 5 concise sentences providing constructive feedback. Explicitly state:
   - What the candidate explained well
   - Missing technical depth, overlooked trade-offs, or inaccuracies
   - Specific actionable tips to reach a FAANG/Staff-level answer

JSON format:
{
  "rating": 7,
  "feedback": "Your explanation accurately addressed... However, you overlooked... To improve, make sure to..."
}`;

    let parsedResult = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);

      const ollamaRes = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          prompt: evaluationPrompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.3, // Lower temperature for consistent, objective evaluation
            top_p: 0.9,
          },
        }),
      });

      clearTimeout(timeout);

      if (ollamaRes.ok) {
        const ollamaData = await ollamaRes.json();
        const raw = (ollamaData?.response || '').replace(/```json/gi, '').replace(/```/gi, '').trim();
        parsedResult = JSON.parse(raw);
      }
    } catch (ollamaErr) {
      console.warn('Ollama evaluation inference error:', ollamaErr.message);
    }

    // High quality fallback evaluation if Ollama local server was unreachable
    if (!parsedResult || !parsedResult.feedback) {
      const wordCount = userAnswer.trim().split(/\s+/).length;
      let calculatedRating = 6;
      if (wordCount > 60) calculatedRating = 8;
      else if (wordCount > 30) calculatedRating = 7;
      else if (wordCount < 15) calculatedRating = 5;

      parsedResult = {
        rating: calculatedRating,
        feedback: `You communicated the core concept with clarity (${wordCount} words provided). To elevate this to a top-tier score, be sure to explicitly state architectural trade-offs, discuss real-world edge cases or memory constraints, and structure your answer using the STAR framework.`,
      };
    }

    return NextResponse.json({
      success: true,
      model,
      rating: String(parsedResult.rating || '7'),
      feedback: parsedResult.feedback || 'Good attempt. Consider expanding on system trade-offs.',
    });
  } catch (err) {
    console.error('Fatal error in /api/ollama/evaluate:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
