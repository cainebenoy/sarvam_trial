import { NextResponse } from 'next/server';

// IMPORTANT: Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual Gemini API key.
// For production, consider using environment variables (e.g., process.env.GEMINI_API_KEY)
// and securing them properly.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Changed to use environment variable
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

export async function POST() {
  try {
    const prompt = "Generate a short, funny, and typical scolding a Malayali mother would say to her child for being lazy or wasting time. The response must be in Malayalam, but written using only English letters (Manglish). Keep it to one or two sentences.";
            
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 100,
        }
    };

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error response:', errorData);
        return NextResponse.json({ error: `Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}` }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const scoldingText = data.candidates[0].content.parts[0].text.trim();
        return NextResponse.json({ scolding: scoldingText });
    } else {
        console.error('Invalid response structure from Gemini API:', data);
        return NextResponse.json({ error: 'Invalid response from Gemini API' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Failed to generate scolding' }, { status: 500 });
  }
}
