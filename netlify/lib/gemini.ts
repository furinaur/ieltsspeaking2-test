import { GoogleGenAI } from '@google/genai';

// Override in Netlify (Site configuration → Environment variables) if you want a different model.
export const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

let client: GoogleGenAI | null = null;

export function hasApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getAI(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Tiny Express-style shim so the original handler bodies work unchanged.
export function makeRes() {
  let code = 200;
  const res = {
    status(c: number) {
      code = c;
      return res;
    },
    json(data: unknown) {
      return jsonResponse(data, code);
    },
  };
  return res;
}

export const MISSING_KEY_RESPONSE = () =>
  jsonResponse(
    {
      error:
        'GEMINI_API_KEY is not set on the server. Add it in Netlify → Site configuration → Environment variables, then redeploy.',
    },
    500,
  );
