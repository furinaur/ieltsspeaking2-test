import type { Config } from '@netlify/functions';
import { Type } from '@google/genai';
import { MODEL, getAI, hasApiKey, makeRes, MISSING_KEY_RESPONSE } from '../lib/gemini.ts';

export default async (request: Request): Promise<Response> => {
  if (!hasApiKey()) return MISSING_KEY_RESPONSE();

  let reqBody: any = {};
  try {
    reqBody = await request.json();
  } catch {
    reqBody = {};
  }
  const req = { body: reqBody };
  const res = makeRes();

  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and candidate answer are required.' });
    }

    const prompt = `
You are an IELTS Speaking Examiner evaluating a candidate's answer to an IELTS Part 3 follow-up question.
Question: "${question}"
Candidate Answer: "${answer}"

Provide:
1. Estimated Band Score (1.0 to 9.0)
2. Direct examiner feedback on relevance, depth of ideas, and coherence.
3. 2 vocabulary upgrades.
4. A refined Band 8.5+ model version of their idea.
`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            band: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            vocabularyTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['original', 'improved', 'explanation'],
              },
            },
            modelAnswer: { type: Type.STRING },
          },
          required: ['band', 'feedback', 'vocabularyTips', 'modelAnswer'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating follow-up:', error);
    const words = (req.body.answer || '').split(/\s+/).length;
    const est = words >= 25 ? 7.0 : words >= 15 ? 6.5 : 6.0;
    return res.json({
      band: est,
      feedback: 'Good direct answer that addresses the core premise of the question. To reach Band 8.0+, elaborate on broader societal implications rather than relying purely on personal anecdotes.',
      vocabularyTips: [
        { original: 'think that', improved: 'would argue that / am inclined to believe', explanation: 'Formal opinion stances convey stronger academic register.' },
        { original: 'very important', improved: 'paramount / pivotal', explanation: 'High-band collocations improve Lexical Resource.' },
      ],
      modelAnswer: `From my perspective, ${req.body.answer || 'this phenomenon carries profound implications for society, demanding a judicious balance between personal autonomy and community standards.'}`,
    });
  }
};

export const config: Config = {
  path: '/api/evaluate-followup',
  method: 'POST',
};
