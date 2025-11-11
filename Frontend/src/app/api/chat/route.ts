import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Initialize Gemini AI client (will check for valid key in POST handler)
// Use environment variable instead of hardcoded key
let genAI: GoogleGenerativeAI | null = null;

// Only initialize if we have a valid API key (not 'dev')
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dev') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
  }
} else {
  console.warn('GEMINI_API_KEY is not set or is set to "dev". Chat functionality will be limited.');
}

// Load the bot instructions from the MD file
const getBotInstructions = () => {
  // Read the file from the public directory
  const filePath = path.join(process.cwd(), 'public', 'EcoScan-AI-Bot-Instructions.md');
  const instructionsText = fs.readFileSync(filePath, 'utf8');
  return instructionsText;
};

export async function POST(req: Request) {
  try {
    // Check if API key is valid
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dev') {
      return NextResponse.json(
        { 
          error: 'GEMINI_API_KEY is not configured. Please add a valid Gemini API key to your .env.local file. You can get one from https://makersuite.google.com/app/apikey' 
        },
        { status: 500 }
      );
    }

    const { prompt, image, audio } = await req.json();
    
    if (!prompt && !image && !audio) {
      return NextResponse.json(
        { error: 'No prompt, image, or audio provided' },
        { status: 400 }
      );
    }

    if (!genAI) {
      return NextResponse.json(
        { 
          error: 'GEMINI_API_KEY is not configured. Please add a valid Gemini API key to your .env.local file. You can get one from https://makersuite.google.com/app/apikey' 
        },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Get the bot instructions
    let instructions = '';
    try {
      instructions = getBotInstructions();
    } catch (error) {
      console.warn('Could not load bot instructions file, continuing without it:', error);
    }
    
    // Create an enhanced prompt with the instructions as context
    const enhancedPrompt = `
You are EcoScan AI, an eco-friendly waste management assistant.
${instructions ? `Use the following instruction manual to guide your responses:\n\n${instructions}\n\n` : ''}
Now, please respond to the user's query in a helpful, friendly, and informative manner:
${prompt || 'Analyze the provided image and provide sustainability insights.'}
`;

    let response;
    if (image) {
      // Handle image-based queries
      try {
        const imageData = await fetch(image).then(res => res.arrayBuffer());
        const imageMimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
        
        const result = await model.generateContent([
          enhancedPrompt,
          {
            inlineData: {
              data: Buffer.from(imageData).toString('base64'),
              mimeType: imageMimeType
            }
          }
        ]);
        response = result.response;
      } catch (imageError: any) {
        console.error('Image processing error:', imageError);
        throw new Error(`Failed to process image: ${imageError.message}`);
      }
    } else if (audio) {
      // Handle audio-based queries
      try {
        const audioData = await fetch(audio).then(res => res.arrayBuffer());
        const result = await model.generateContent([
          enhancedPrompt,
          {
            inlineData: {
              data: Buffer.from(audioData).toString('base64'),
              mimeType: 'audio/wav'
            }
          }
        ]);
        response = result.response;
      } catch (audioError: any) {
        console.error('Audio processing error:', audioError);
        throw new Error(`Failed to process audio: ${audioError.message}`);
      }
    } else {
      // Handle text-only queries
      const result = await model.generateContent(enhancedPrompt);
      response = result.response;
    }

    const responseText = response.text();
    
    if (!responseText) {
      throw new Error('Empty response from AI model');
    }

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process request';
    
    if (error.message?.includes('API_KEY')) {
      errorMessage = 'Invalid or missing Gemini API key. Please check your GEMINI_API_KEY in .env.local';
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = 'API quota exceeded. Please try again later or check your API key limits.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}