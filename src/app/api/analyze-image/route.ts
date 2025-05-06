import { NextRequest, NextResponse } from 'next/server';

const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const API_KEY = process.env.NVIDIA_API_KEY; // Access the key from environment variables

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    console.error("NVIDIA API key not configured in environment variables.");
    return NextResponse.json(
      { message: "Server configuration error: NVIDIA API key not found." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const imageB64 = body.imageB64; // Expecting base64 string in the request body
    const prompt = body.prompt || "Describe this image in detail, focusing on clothing items, styles, colors, and patterns if present."; // More specific default prompt

    if (!imageB64) {
      return NextResponse.json(
        { message: "Missing image data (imageB64)" },
        { status: 400 }
      );
    }

    // Estimate size - this is an approximation
    const estimatedSize = imageB64.length * 0.75; // Base64 is ~33% larger than binary
    if (estimatedSize > 180_000) {
       console.warn(`Image size potentially too large: ~${Math.round(estimatedSize / 1024)} KB`);
       // Allow the API call anyway, let NVIDIA handle the exact limit check
       // You might want to add a stricter check here based on experience
       // return NextResponse.json(
       //  { message: "Image size potentially too large" },
       //  { status: 413 } // Payload Too Large
       // );
    }

    const headers = {
      "Authorization": `Bearer ${API_KEY}`,
      "Accept": "application/json", // Non-streaming for simplicity
      "Content-Type": "application/json",
    };

    const payload = {
      model: 'meta/llama-4-maverick-17b-128e-instruct',
      messages: [
        {
          role: "user",
          content: `${prompt} <img src="data:image/png;base64,${imageB64}" />`
        }
      ],
      max_tokens: 512,
      temperature: 0.70, // Adjusted temperature for potentially more focused descriptions
      top_p: 1.00,
      stream: false // Keep false for single JSON response
    };

    console.log("Sending request to NVIDIA API...");
    const response = await fetch(INVOKE_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    console.log(`NVIDIA API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA API Error Response:", errorText);
      // Try to parse JSON error if possible
      let errorDetails = errorText;
      try {
        errorDetails = JSON.parse(errorText);
      } catch (parseError) {
        // Ignore if it's not JSON
      }
      return NextResponse.json(
        { message: `NVIDIA API request failed with status ${response.status}`, details: errorDetails },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Received successful response from NVIDIA API.");

    // Return the analysis result from NVIDIA
    return NextResponse.json(data);

  } catch (error) {
    console.error('Internal server error in /api/analyze-image:', error);
    return NextResponse.json(
      { message: 'Internal server error during image analysis', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 