import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Env } from './models';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers });
  }

  try {
    const requestBody: any = await request.json();
    const { image, prompt, model: modelName, imageUrl } = requestBody;

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image data is required' }), { status: 400, headers });
    }
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers });
    }

    const base64Data = image.split(',')[1] || image;
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');
    
    const model = genAI.getGenerativeModel({ 
      model: modelName || 'gemini-3.6-flash',
      generationConfig: {
        temperature: 1.0,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            s: { type: SchemaType.STRING },
            g: { 
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            },
            d: {
              type: SchemaType.OBJECT,
              properties: {
                gen: { type: SchemaType.STRING },
                clo: { type: SchemaType.STRING },
                pos: { type: SchemaType.STRING },
                bkg: { type: SchemaType.STRING },
                har: { type: SchemaType.STRING },
                ski: { type: SchemaType.STRING },
                lig: { type: SchemaType.STRING },
                exp: { type: SchemaType.STRING }
              },
              required: ["gen", "clo", "pos", "bkg", "har", "ski", "lig", "exp"]
            },
            r: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            },
            e: {
              type: SchemaType.OBJECT,
              properties: {
                emo: { type: SchemaType.STRING },
                app: { type: SchemaType.STRING },
                conf: { type: SchemaType.STRING, format: "enum", enum: ["low", "medium", "high"] },
                mood: { type: SchemaType.STRING }
              },
              required: ["emo", "app", "conf", "mood"]
            },
            w: {
              type: SchemaType.ARRAY,
              items: { 
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  ingredients: { type: SchemaType.STRING }
                },
                required: ["title", "description", "ingredients"]
              }
            }
          },
          required: ["s", "g", "d", "r", "e", "w"]
        }
      }
    });

    const response = await model.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
      prompt
    ]);

    const result = response.response;
    const jsonText = result.text();
    const parsedResult = JSON.parse(jsonText);
    
    if (result.usageMetadata) {
      parsedResult.tokenUsage = {
        promptTokens: result.usageMetadata.promptTokenCount,
        responseTokens: result.usageMetadata.candidatesTokenCount,
        totalTokens: result.usageMetadata.totalTokenCount
      };
    }

    // D1 logging if binding exists
    if (env.DB) {
      try {
        const id = crypto.randomUUID();
        const ip = request.headers.get('cf-connecting-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const msgBuffer = new TextEncoder().encode(ip + userAgent);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const userId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

        const modelUsed = modelName || 'gemini-3.6-flash';
        const promptTokens = result.usageMetadata?.promptTokenCount || 0;
        const completionTokens = result.usageMetadata?.candidatesTokenCount || 0;
        const totalTokens = result.usageMetadata?.totalTokenCount || 0;

        await env.DB.prepare(
          'INSERT INTO analysis_logs (id, user_id, image_url, model_used, prompt_tokens, completion_tokens, total_tokens) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, userId, imageUrl || null, modelUsed, promptTokens, completionTokens, totalTokens).run();
      } catch (dbError) {
        console.error('Database logging failed:', dbError);
      }
    }

    return new Response(JSON.stringify(parsedResult), { status: 200, headers });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers }
    );
  }
};
