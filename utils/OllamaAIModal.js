/**
 * Client service interface for Ollama Local AI Engine
 * Communicates with Next.js API proxy routes (/api/ollama/*) to eliminate browser CORS
 */

export const OllamaService = {
  /**
   * Check if Ollama is running and get installed models
   */
  checkStatus: async () => {
    try {
      const res = await fetch('/api/ollama/status', { cache: 'no-store' });
      return await res.json();
    } catch (err) {
      return { online: false, message: err.message, models: [] };
    }
  },

  /**
   * Generate interview questions for a given position and tech stack
   */
  generateQuestions: async ({ jobPosition, jobDesc, jobExperience, questionCount = 5, model }) => {
    const res = await fetch('/api/ollama/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobPosition,
        jobDesc,
        jobExperience,
        questionCount,
        model,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama question generation failed (HTTP ${res.status})`);
    }

    return await res.json();
  },

  /**
   * Evaluate a candidate's answer and return rating + constructive feedback
   */
  evaluateAnswer: async ({ question, correctAnswer, userAnswer, model }) => {
    const res = await fetch('/api/ollama/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        correctAnswer,
        userAnswer,
        model,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama answer evaluation failed (HTTP ${res.status})`);
    }

    return await res.json();
  },

  /**
   * Analyze candidate resume against target role and job description
   */
  analyzeResume: async ({ resumeText, targetRole, targetJobDesc, model }) => {
    const res = await fetch('/api/ollama/resume-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText,
        targetRole,
        targetJobDesc,
        model,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama resume analysis failed (HTTP ${res.status})`);
    }

    return await res.json();
  },
};

/**
 * Backward-compatible chatSession wrapper using Ollama
 */
export const chatSession = {
  sendMessage: async (promptPayload) => {
    // If prompt is simple text for evaluation or generation
    let promptText = '';
    if (typeof promptPayload === 'string') {
      promptText = promptPayload;
    } else if (Array.isArray(promptPayload)) {
      // Find the text item
      const textItem = promptPayload.find((p) => typeof p === 'string');
      promptText = textItem || JSON.stringify(promptPayload);
    } else {
      promptText = JSON.stringify(promptPayload);
    }

    // Determine whether this is question generation or answer evaluation
    if (promptText.includes('Interview question') || promptText.includes('Job position:')) {
      // Extract parameters or use default
      const res = await OllamaService.generateQuestions({
        jobPosition: 'Software Engineer',
        jobDesc: promptText,
        jobExperience: '3',
        questionCount: 5,
      });

      return {
        response: {
          text: () => res.rawJson || JSON.stringify(res.questions),
        },
      };
    }

    // Default evaluation payload
    const res = await OllamaService.evaluateAnswer({
      question: 'Technical Interview Question',
      correctAnswer: 'Technical concepts and trade-offs',
      userAnswer: promptText,
    });

    return {
      response: {
        text: () =>
          JSON.stringify({
            rating: res.rating || '7',
            feedback: res.feedback || 'Good attempt.',
          }),
      },
    };
  },
};

export default OllamaService;
