import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const configuredModel = process.env.OLLAMA_MODEL || 'llama3.2';

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
    const hasConfiguredModel = models.some((m) =>
      m.toLowerCase().startsWith(configuredModel.toLowerCase())
    );

    return NextResponse.json({
      online: true,
      baseUrl,
      model: configuredModel,
      hasConfiguredModel,
      models,
      activeModel: hasConfiguredModel ? configuredModel : models[0] || configuredModel,
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
