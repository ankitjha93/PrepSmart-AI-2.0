import { NextResponse } from 'next/server';

export async function POST(req) {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const defaultModel = process.env.OLLAMA_MODEL || 'llama3.2';

  try {
    const body = await req.json();
    const {
      jobPosition = 'Full Stack Developer',
      jobDesc = 'React, Node.js, Next.js, PostgreSQL',
      jobExperience = '3',
      questionCount = 5,
      model = defaultModel,
    } = body;

    const count = parseInt(questionCount, 10) || 5;

    const systemPrompt = `You are a Principal Tech Interviewer and Staff Hiring Bar Raiser at a top tier technology firm.
Your task is to generate realistic, in-depth technical and behavioral interview questions tailored strictly to the role, seniority, and tech stack provided.

Role: ${jobPosition}
Technologies & Context: ${jobDesc}
Years of Experience: ${jobExperience} Years
Number of Questions: ${count}

CRITICAL RULES:
1. Return strictly a JSON array containing exactly ${count} objects.
2. Each object must contain exactly two keys: "question" (string) and "answer" (string).
3. The "answer" should be a comprehensive model response highlighting key architectural principles, trade-offs, and expected candidate answers.
4. Do NOT wrap your output in markdown backticks or commentary. Output raw valid JSON.

JSON Schema format:
[
  {
    "question": "Question text here...",
    "answer": "Expected comprehensive model answer here..."
  }
]`;

    // Attempt to call Ollama
    let rawText = '';
    let parsedQuestions = null;

    try {
      const controller = new AbortController();
      // Allow 60 seconds for local model inference
      const timeout = setTimeout(() => controller.abort(), 60000);

      const ollamaRes = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          prompt: systemPrompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      clearTimeout(timeout);

      if (ollamaRes.ok) {
        const ollamaData = await ollamaRes.json();
        rawText = ollamaData?.response || '';

        // Clean rawText
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedQuestions = parsed;
        } else if (parsed?.questions && Array.isArray(parsed.questions)) {
          parsedQuestions = parsed.questions;
        } else if (parsed?.interviewQuestions && Array.isArray(parsed.interviewQuestions)) {
          parsedQuestions = parsed.interviewQuestions;
        } else if (parsed?.interview_questions && Array.isArray(parsed.interview_questions)) {
          parsedQuestions = parsed.interview_questions;
        } else if (parsed && typeof parsed === 'object') {
          // If Ollama returned a single object with question & answer
          if (parsed.question && parsed.answer) {
            parsedQuestions = [parsed];
          }
        }
      }
    } catch (ollamaErr) {
      console.warn('Ollama generation network/inference error:', ollamaErr.message);
    }

    // Fallback high-quality questions tailored to the position if Ollama returned error or is offline
    if (!parsedQuestions || parsedQuestions.length === 0) {
      const fallbackQuestions = [
        {
          question: `In modern ${jobPosition || 'Software'} engineering, what core architectural trade-offs do you evaluate when building scalable systems with ${jobDesc || 'modern stacks'}, and how do you prevent performance bottlenecks?`,
          answer: `Explain separation of concerns, distributed caching layers (Redis/CDN), choosing appropriate state synchronization, and database indexing strategies under high concurrent throughput.`
        },
        {
          question: `How do you approach diagnostic troubleshooting and root-cause analysis when an unexpected production latency spike or memory leak occurs?`,
          answer: `Use profiling tools, inspect thread/event loops, examine slow query logs with EXPLAIN ANALYZE, analyze metrics (CPU, RAM, garbage collection pauses), and implement structured logging and canary deployments.`
        },
        {
          question: `Describe your strategy for securing application data, token rotation, and mitigating threats such as XSS, CSRF, or SQL injection.`,
          answer: `Highlight HttpOnly SameSite cookie configurations, automated JSX escaping, parameterized queries/ORMs, Content Security Policy (CSP), and zero-trust API authorization.`
        },
        {
          question: `Describe how asynchronous tasks, microtasks, and event reconciliation interact under heavy user interaction.`,
          answer: `Detail Promise microtask queues versus macrotask timers, batched UI updates, debouncing/throttling, and lifecycle clean-ups to prevent stale closures and memory leaks.`
        },
        {
          question: `Tell me about a high-stakes technical deadline or architecture migration you led for a ${jobPosition || 'developer'} role, and how you ensured system resilience.`,
          answer: `Structure response using the STAR method (Situation, Task, Action, Result). Quantify measurable impact (e.g. 40% latency reduction, 99.99% uptime) and explain post-mortem preventative safeguards.`
        }
      ];

      parsedQuestions = fallbackQuestions.slice(0, count);
    }

    // Normalize items
    const normalized = parsedQuestions.map((q, idx) => ({
      question: q.question || q.Question || q.interview_question || `Interview Question #${idx + 1}`,
      answer: q.answer || q.Answer || q.expected_answer || 'Articulate architectural fundamentals, trade-offs, and concrete examples.'
    }));

    return NextResponse.json({
      success: true,
      model,
      count: normalized.length,
      questions: normalized,
      rawJson: JSON.stringify(normalized),
    });
  } catch (err) {
    console.error('Fatal error in /api/ollama/generate:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
