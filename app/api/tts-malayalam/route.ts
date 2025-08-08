import { NextResponse } from 'next/server';
import { SarvamAIClient } from "sarvamai"; // Import the SarvamAIClient
import { writeFile } from 'fs/promises';
import path from 'path';

// Environment variables for API keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SARVAM_API_SUBSCRIPTION_KEY = process.env.SARVAM_API_SUBSCRIPTION_KEY;

// Gemini API URL for translation
const GEMINI_TRANSLATION_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: Request) {
  if (!GEMINI_API_KEY || !SARVAM_API_SUBSCRIPTION_KEY) {
    return NextResponse.json({ error: 'API keys not configured. Please ensure GEMINI_API_KEY and SARVAM_API_SUBSCRIPTION_KEY are set.' }, { status: 500 });
  }

  try {
    const { manglishText } = await request.json();

    if (!manglishText) {
      return NextResponse.json({ error: 'Manglish text is required.' }, { status: 400 });
    }

    // Step 1: Translate Manglish to proper Malayalam script using Gemini
    const translationPrompt = `Translate the following Manglish text to proper Malayalam script. Only provide the translated text, no extra words or explanations: "${manglishText}"`;
    
    const geminiTranslationRequestBody = {
        contents: [{
            parts: [{
                text: translationPrompt
            }]
        }],
        generationConfig: {
            temperature: 0.1, // Keep temperature low for accurate translation
            maxOutputTokens: 200,
        }
    };

    const geminiTranslationResponse = await fetch(GEMINI_TRANSLATION_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiTranslationRequestBody)
    });

    if (!geminiTranslationResponse.ok) {
        const errorData = await geminiTranslationResponse.json();
        console.error('Gemini Translation API error response:', errorData);
        return NextResponse.json({ error: `Translation failed: ${errorData.error?.message || 'Unknown error'}` }, { status: geminiTranslationResponse.status });
    }

    const geminiTranslationData = await geminiTranslationResponse.json();
    const malayalamText = geminiTranslationData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!malayalamText) {
        console.error('No translation received from Gemini:', geminiTranslationData);
        return NextResponse.json({ error: 'Failed to translate text to Malayalam.' }, { status: 500 });
    }

    console.log('Translated Malayalam Text:', malayalamText); // For debugging

    // Step 2: Call Sarvam AI Text-to-Speech API using your provided client code
    const client = new SarvamAIClient({
        apiSubscriptionKey: SARVAM_API_SUBSCRIPTION_KEY,
    });

    // Use the exact parameters you provided
    const audioResponse = await client.textToSpeech.convert({
        text: malayalamText,
        target_language_code: "ml-IN",
        speaker: "arya",
        pitch: 0.1,
        pace: 1,
        loudness: 1,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v2"
    });

    // Log the response structure to understand the format
    console.log('SarvamAI response type:', typeof audioResponse);
    console.log('SarvamAI response keys:', Object.keys(audioResponse || {}));
    
    // Handle the response - SarvamAI returns an object with 'audios' array
    let audioBuffer: Buffer;
    if (audioResponse && typeof audioResponse === 'object') {
        const responseObj = audioResponse as any;
        
        // SarvamAI returns { request_id: string, audios: [base64_string] }
        // The audios array contains the base64 string directly, not wrapped in an object
        if (responseObj.audios && Array.isArray(responseObj.audios) && responseObj.audios.length > 0) {
            const audioData = responseObj.audios[0]; // Get first audio from array (it's the base64 string directly)
            console.log('Found audio data, type:', typeof audioData);
            console.log('Audio data length:', audioData?.length);
            
            if (typeof audioData === 'string') {
                // Base64 encoded audio - this is the correct format
                audioBuffer = Buffer.from(audioData, 'base64');
                console.log('Converted base64 to buffer, size:', audioBuffer.length);
            } else {
                throw new Error('Audio data is not a base64 string');
            }
        } else {
            console.error('No audios array found in response:', responseObj);
            throw new Error('No audio data found in SarvamAI response');
        }
    } else {
        throw new Error('Invalid response format from SarvamAI');
    }
    
    // Save audio file to public/audio directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scolding-${timestamp}.mp3`;
    const filePath = path.join(process.cwd(), 'public', 'audio', filename);
    
    try {
        await writeFile(filePath, audioBuffer);
        console.log(`Audio file saved: ${filename} (${audioBuffer.length} bytes)`);
    } catch (fileError) {
        console.error('Error saving audio file:', fileError);
        // Continue anyway - file saving is for debugging
    }

    // The 'audioResponse' from client.textToSpeech.convert is expected to be the raw audio data (e.g., ArrayBuffer or Buffer)
    // We convert it to a Blob and return it as a NextResponse.
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

    return new NextResponse(audioBlob, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="scolding.mp3"',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error in TTS API route:', error);
    // Provide a more informative error message if the Sarvam client itself throws an error
    if (error instanceof Error) {
        return NextResponse.json({ error: `Failed to generate speech: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
