import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const configuredModel = process.env.OLLAMA_MODEL || 'llama3.3';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({
        online: false,
        baseUrl,
        model: configuredModel,
        models: [],
        message: `Ollama returned HTTP status ${res.status}`,
      });
    }

    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    
    // Check if configured model or latest popular models are available locally
    const matchedModel = models.find((m) =>
      m.toLowerCase().startsWith(configuredModel.toLowerCase())
    ) || models.find((m) =>
      m.toLowerCase().startsWith('llama3.3') ||
      m.toLowerCase().startsWith('llama3.2') ||
      m.toLowerCase().startsWith('deepseek-r1')
    );

    const activeModel = matchedModel || configuredModel;

    return NextResponse.json({
      online: true,
      baseUrl,
      model: configuredModel,
      hasConfiguredModel: Boolean(matchedModel),
      models,
      activeModel,
    });
  } catch (err) {
    return NextResponse.json({
      online: false,
      baseUrl,
      model: configuredModel,
      models: [],
      message: err.name === 'AbortError' ? 'Ollama connection timed out' : err.message,
    });
  }
}
