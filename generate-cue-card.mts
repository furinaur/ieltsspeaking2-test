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
    const { topic, category } = req.body;

    const prompt = `
Create a realistic and authentic IELTS Speaking Test Part 2 Cue Card.
${topic ? `Requested topic/theme: ${topic}` : 'Generate a popular recent IELTS exam topic.'}
${category && category !== 'all' ? `Category: ${category}` : ''}

Format must strictly adhere to the IELTS standard:
- Title starting with "Describe a ..."
- Exactly 4 bullet cue points ("You should say: ... and explain ...")
- 3 examiner band tips
- 4 high-value Band 7-8 vocabulary items with word, definition, and example sentence.
`;

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            cuePoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            bandTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedVocab: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['word', 'meaning', 'example'],
              },
            },
          },
          required: ['id', 'title', 'category', 'cuePoints', 'bandTips', 'suggestedVocab'],
        },
      },
    });

    const cueCard = JSON.parse(response.text || '{}');
    cueCard.id = `custom-${Date.now()}`;
    return res.json(cueCard);
  } catch (error: any) {
    console.error('Error generating cue card:', error);
    const cat = req.body.category || 'experiences';
    const topic = req.body.topic || 'an unforgettable life lesson';
    return res.json({
      id: `custom-${Date.now()}`,
      title: `Describe ${topic.startsWith('a ') || topic.startsWith('an ') ? topic : `a memorable experience regarding ${topic}`}`,
      category: cat,
      cuePoints: [
        'When and where this occurred',
        'Who was involved with you at that time',
        'What specific events or challenges took place',
        'And explain what valuable lesson or insight you acquired from it',
      ],
      bandTips: [
        'Vary your past tense forms: Past Continuous for setting the scene and Past Perfect for prior events.',
        'Adopt evocative descriptive adjectives instead of generic words like "good" or "nice".',
        'Reserve at least 30 seconds for the final "And explain why" bullet point.',
      ],
      suggestedVocab: [
        { word: 'Enlightening', meaning: 'Giving greater knowledge and understanding about a subject or situation', example: 'The entire workshop proved to be deeply enlightening.' },
        { word: 'Formidable', meaning: 'Inspiring fear or respect through being impressively large, powerful, or intense', example: 'We encountered formidable obstacles along the way.' },
        { word: 'In retrospect', meaning: 'When looking back on a past event or situation', example: 'In retrospect, that unexpected setback was a blessing in disguise.' },
        { word: 'Perseverance', meaning: 'Continued effort to do or achieve something despite difficulties', example: 'Through sheer perseverance, we achieved the target.' },
      ],
    });
  }
};

export const config: Config = {
  path: '/api/generate-cue-card',
  method: 'POST',
};
