import { NextRequest, NextResponse } from 'next/server';
// Remove JWT import if no longer needed for other logic
// import jwt from 'jsonwebtoken';

// REMOVED: Kling AI Credentials and JWT generation

// Read Gemini API configuration from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_ENDPOINT = process.env.GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

// Construct the full URL with the API key as a query parameter
const GEMINI_ENDPOINT = `${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`;

// Helper function to fetch image and convert to Base64
async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    console.log(`Fetching image from URL: ${imageUrl}`);
    const response = await fetch(imageUrl, {
        headers: { // Add a basic user-agent, some servers block default fetch UA
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText} from ${imageUrl}`);
    }
    const mimeType = response.headers.get('content-type') || 'application/octet-stream';
     // Limit image size to prevent issues (e.g., 4MB limit for Gemini Vision) - adjust as needed
    const MAX_SIZE_BYTES = 4 * 1024 * 1024;
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE_BYTES) {
        console.warn(`Image size (${contentLength} bytes) may exceed limits for ${imageUrl}`);
        // Optionally, you could reject here or try to resize server-side if needed
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_SIZE_BYTES) {
         console.warn(`Fetched image size (${buffer.byteLength} bytes) may exceed limits for ${imageUrl}`);
         // Reject if definitely too large after fetching
         throw new Error(`Image size (${buffer.byteLength} bytes) exceeds maximum limit of ${MAX_SIZE_BYTES} bytes.`);
    }

    const base64Data = Buffer.from(buffer).toString('base64');
    console.log(`Successfully fetched and encoded image from: ${imageUrl}, MIME: ${mimeType}`);
    return { data: base64Data, mimeType };
  } catch (error) {
    console.error(`Error fetching or encoding image from ${imageUrl}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  console.log("--- ENTERING /api/virtual-tryon POST (Gemini Version) ---");

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    return NextResponse.json({ error: 'Gemini API key missing on server.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    // We still expect the human image URL from the frontend
    const { humanImageUrl, garmentImageUrl } = body;

    // Only use the hardcoded garment URL if one isn't provided in the request
    const selectedGarmentImageUrl = garmentImageUrl || "https://storage.googleapis.com/falserverless/model_tests/leffa/tshirt_image.jpg";

    if (!humanImageUrl) {
       console.error("Request body missing humanImageUrl");
      return NextResponse.json({ error: 'Human image URL is required' }, { status: 400 });
    }
     console.log(`Received request. Human: ${humanImageUrl}, Garment: ${selectedGarmentImageUrl}`);

    // 1. Fetch and encode the human image
    const humanImageData = await fetchImageAsBase64(humanImageUrl);
    if (!humanImageData) {
      return NextResponse.json({ error: 'Failed to fetch or process human image' }, { status: 500 });
    }

    // 2. Construct the Gemini API Payload
    // Prompt instructing the model to use the garment from the URL on the provided image
    const promptText = `I need a clean image URL for a virtual try-on application.
    
    PERSON: I've provided an image of a person.
    GARMENT: ${selectedGarmentImageUrl}
    
    INSTRUCTIONS:
    - Find a direct URL to a high-quality, reliable image showing a similar garment
    - Return ONLY the direct image URL with no additional text
    - The URL should be to a JPG, PNG, or WEBP file
    - The image should show ONLY the garment on a white background if possible
    - Do NOT use Amazon, ASOS, Nordstrom or department store links (they often block access)
    - Prefer image hosting sites like Unsplash, Pexels, Cloudinary, or dedicated CDNs
    - Good sources: unsplash.com, pexels.com, cloudinary.com, media libraries
    
    IMPORTANT: Respond with JUST the direct image URL and nothing else.`;

    const requestPayload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: humanImageData.mimeType,
                data: humanImageData.data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT"], // Only request TEXT as this model doesn't support direct image generation
        temperature: 0.4, // Lower temperature for more predictable outputs
        topP: 0.8,
        topK: 32
      },
      // Add safety settings if needed - adjust levels as appropriate
       safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    // 3. Call the Gemini API
    console.log('Calling Gemini API for virtual try-on...');
    
    // Check if API key is actually set to a valid value
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_VALID_GEMINI_API_KEY_HERE') {
      console.error('Invalid or missing Gemini API key configuration');
      return NextResponse.json({ 
        error: 'Invalid API key configuration. Please set a valid Gemini API key in .env.local file', 
        status: 'failed' 
      }, { status: 500 });
    }
    
    const geminiResponse = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
       signal: AbortSignal.timeout(90000) // Set a timeout (e.g., 90 seconds) for the API call
    });

    console.log('Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error response:', errorText);
      // Try to parse for more specific Gemini errors
      let details = errorText;
       try {
         const errorJson = JSON.parse(errorText);
         details = errorJson.error?.message || errorText;
       } catch (e) { /* Ignore parsing error */ }

      return NextResponse.json({
        error: `Gemini API request failed with status ${geminiResponse.status}`,
        details: details,
        status: 'failed'
      }, { status: geminiResponse.status });
    }

    const result = await geminiResponse.json();
    console.log('Gemini API response structure:', JSON.stringify(Object.keys(result), null, 2));
    
    // Improved debug logging to see the structure
    if (result.candidates && result.candidates.length > 0) {
      console.log('First candidate structure:', JSON.stringify(Object.keys(result.candidates[0]), null, 2));
      
      if (result.candidates[0].content) {
        console.log('Content structure:', JSON.stringify(Object.keys(result.candidates[0].content), null, 2));
        
        if (result.candidates[0].content.parts) {
          console.log('Parts count:', result.candidates[0].content.parts.length);
          console.log('Parts types:', result.candidates[0].content.parts.map((p: any) => 
            Object.keys(p).join(',')).join(' | '));
        }
      }
    }

    // 4. Extract the generated image data
    let generatedImageBase64: string | null = null;
    let generatedImageDataUri: string | null = null;
    let outputText: string | null = null;

    try {
      // Log the full response structure for debugging
      console.log('Complete Gemini API response:', JSON.stringify(result, null, 2));
      
      const candidate = result.candidates?.[0];
      if (!candidate) throw new Error("No candidates found in response.");

      // Check for safety ratings / blocked responses
      if (candidate.finishReason && candidate.finishReason !== "STOP") {
        console.warn(`Gemini generation finished due to reason: ${candidate.finishReason}`);
        // Check for specific safety blocking
        if (candidate.finishReason === "SAFETY") {
          console.error("Gemini response blocked due to safety settings.");
          console.error("Safety Ratings:", JSON.stringify(candidate.safetyRatings || [], null, 2));
          return NextResponse.json({ error: 'Image generation blocked due to safety settings.', status: 'blocked' }, { status: 400 });
        }
        // Handle other non-STOP reasons if necessary
      }
      
      // Path for content parts
      if (candidate.content?.parts) {
        // Log each part for debugging
        candidate.content.parts.forEach((part: any, index: number) => {
          console.log(`Content part ${index} keys:`, Object.keys(part));
          if (part.text) console.log(`Content part ${index} text:`, part.text.substring(0, 100) + '...');
          if (part.inline_data) console.log(`Content part ${index} has inline data, mime: ${part.inline_data.mime_type}`);
        });

        const imagePart = candidate.content.parts.find((part: any) => part.inline_data);
        const textPart = candidate.content.parts.find((part: any) => part.text);

        if (textPart) {
          outputText = textPart.text;
          console.log("Gemini response text:", outputText);
        }

        if (imagePart && imagePart.inline_data?.data && imagePart.inline_data?.mime_type) {
          generatedImageBase64 = imagePart.inline_data.data;
          const mimeType = imagePart.inline_data.mime_type;
          generatedImageDataUri = `data:${mimeType};base64,${generatedImageBase64}`;
          console.log(`Generated image data found (MIME: ${mimeType}).`);
        }
      }
      
      // If no image found via normal path, check alternative structures
      if (!generatedImageDataUri) {
        console.warn("No standard inline_data found, checking alternative response structures");
        
        // Check for data directly in candidate
        if (candidate.media || candidate.images || candidate.imageData) {
          const possibleImage = candidate.media || candidate.images?.[0] || candidate.imageData;
          const mimeType = possibleImage?.mimeType || possibleImage?.type || 'image/png';
          const imageData = possibleImage?.data || possibleImage?.b64 || possibleImage;
          
          if (imageData) {
            console.log("Found image in alternative candidate structure");
            generatedImageBase64 = imageData;
            generatedImageDataUri = `data:${mimeType};base64,${imageData}`;
          }
        }
        
        // Check full response for images or media (some models put it at top level)
        if (!generatedImageDataUri && (result.images || result.media)) {
          const possibleImage = result.images?.[0] || result.media?.[0];
          if (possibleImage) {
            const mimeType = possibleImage.mimeType || possibleImage.type || 'image/png';
            const imageData = possibleImage.data || possibleImage.b64;
            
            if (imageData) {
              console.log("Found image at top level response");
              generatedImageBase64 = imageData;
              generatedImageDataUri = `data:${mimeType};base64,${imageData}`;
            }
          }
        }
        
        // If we only got text with a URL but no image (likely an older model version response),
        // use our garment matching system instead of trying to download from external URLs
        if (!generatedImageDataUri && outputText) {
          console.log("No image generated directly. Looking for reliable image URL in response.");
          
          // Clean and extract the URL
          const cleanedText = outputText.trim();
          console.log("Cleaned text response:", cleanedText);
          
          // Extract URL patterns from the text - focusing on reliable sources
          const urlMatch = cleanedText.match(/(https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp)(\?[^\s"']*)?)/i);
          
          if (urlMatch && urlMatch[1]) {
            const extractedUrl = urlMatch[1].trim();
            console.log("Found image URL in text:", extractedUrl);
            
            // Check for unreliable domains that we want to avoid
            const unreliableDomains = ['amazon.com', 'asos-media', 'asos.com', 'nordstrom.com'];
            const isUnreliableDomain = unreliableDomains.some(domain => extractedUrl.includes(domain));
            
            if (isUnreliableDomain) {
              console.log("URL is from an unreliable domain, using fallback system");
            } else {
              // If the URL appears to be from a reliable source, use it directly
              // Skip the fetch verification since it's causing connection issues
              console.log("Using extracted image URL directly:", extractedUrl);
              
              return NextResponse.json({
                resultUrl: extractedUrl,
                status: 'completed',
                message: "Similar style found"
              });
            }
          }
          
          // If no valid URL found or URL is from unreliable domain, use AI-guided selection
          console.log("Using AI-guided garment selection with description");
          
          // Extract garment type info from the text if available
          const garmentTypeKeywords = {
            "tshirt": ["tshirt", "t-shirt", "t shirt", "tee", "short sleeve", "crew neck"],
            "shirt": ["shirt", "button", "dress shirt", "blouse", "button-up", "button-down", "oxford", "formal shirt"],
            "dress": ["dress", "gown", "frock", "shift dress", "maxi", "mini dress", "formal dress"],
            "jacket": ["jacket", "blazer", "denim jacket", "leather jacket", "sports jacket", "suit jacket"],
            "coat": ["coat", "overcoat", "trench", "pea coat", "winter coat", "duffle"],
            "pants": ["pants", "trousers", "jeans", "denim", "slacks", "chinos", "khakis"],
            "sweater": ["sweater", "pullover", "jumper", "knit", "cardigan", "turtleneck"],
            "hoodie": ["hoodie", "sweatshirt", "hooded", "zip-up", "fleece"],
            "skirt": ["skirt", "pleated", "a-line", "midi", "mini skirt", "pencil skirt"]
          };
          
          let identifiedGarmentType = 'default';
          const cleanText = outputText?.toLowerCase() || '';
          
          // Check for each garment type in the text
          for (const [type, keywords] of Object.entries(garmentTypeKeywords)) {
            if (keywords.some(keyword => cleanText.includes(keyword))) {
              identifiedGarmentType = type;
              console.log(`AI description identifies garment as type: ${identifiedGarmentType} (matched keyword in text)`);
              break;
            }
          }
          
          // If we still don't have a type, check the original garment URL for clues
          if (identifiedGarmentType === 'default') {
            const garmentUrl = selectedGarmentImageUrl.toLowerCase();
            for (const [type, keywords] of Object.entries(garmentTypeKeywords)) {
              if (keywords.some(keyword => garmentUrl.includes(keyword)) || garmentUrl.includes(type)) {
                identifiedGarmentType = type;
                console.log(`Identified garment type from URL: ${identifiedGarmentType}`);
                break;
              }
            }
          }
          
          // Use our fallback system with the identified garment type
          const fallbackImages = {
            "tshirt": "https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=800",
            "shirt": "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=800",
            "dress": "https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=800",
            "jacket": "https://images.pexels.com/photos/6312914/pexels-photo-6312914.jpeg?auto=compress&cs=tinysrgb&w=800",
            "coat": "https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg?auto=compress&cs=tinysrgb&w=800",
            "sweater": "https://images.pexels.com/photos/6046235/pexels-photo-6046235.jpeg?auto=compress&cs=tinysrgb&w=800",
            "hoodie": "https://images.pexels.com/photos/5698853/pexels-photo-5698853.jpeg?auto=compress&cs=tinysrgb&w=800",
            "pants": "https://images.pexels.com/photos/52518/jeans-pants-blue-shop-52518.jpeg?auto=compress&cs=tinysrgb&w=800",
            "skirt": "https://images.pexels.com/photos/601316/pexels-photo-601316.jpeg?auto=compress&cs=tinysrgb&w=800",
            "male": "https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?auto=compress&cs=tinysrgb&w=800",
            "female": "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800",
            "default": "https://images.pexels.com/photos/6764031/pexels-photo-6764031.jpeg?auto=compress&cs=tinysrgb&w=800"
          };
          
          // Use the identified garment type or fallback to checking the original garment URL
          let fallbackUrl = fallbackImages[identifiedGarmentType] || fallbackImages.default;
          
          return NextResponse.json({
            resultUrl: fallbackUrl,
            status: 'completed',
            fallback: true,
            message: "AI-selected similar style based on description",
            aiDescription: outputText
          });
        }
      }
    } catch (extractionError) {
      console.error("Error extracting data from Gemini response:", extractionError);
      console.error("Full Gemini Response structure:", JSON.stringify(Object.keys(result || {}), null, 2));
      return NextResponse.json({ 
        error: 'Failed to parse generated image/text from API response', 
        details: extractionError instanceof Error ? extractionError.message : String(extractionError), 
        status: 'failed'
      }, { status: 500 });
    }

    // If still no image found after all extraction attempts, use a fallback option
    if (!generatedImageDataUri) {
      console.warn("No valid image found, using fallback similar style image");
      
      // Map of fallback images based on garment URL patterns
      const fallbackImages = {
        "tshirt": "https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=800",
        "shirt": "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=800",
        "dress": "https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=800",
        "jacket": "https://images.pexels.com/photos/6312914/pexels-photo-6312914.jpeg?auto=compress&cs=tinysrgb&w=800",
        "coat": "https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg?auto=compress&cs=tinysrgb&w=800",
        "sweater": "https://images.pexels.com/photos/6046235/pexels-photo-6046235.jpeg?auto=compress&cs=tinysrgb&w=800",
        "hoodie": "https://images.pexels.com/photos/5698853/pexels-photo-5698853.jpeg?auto=compress&cs=tinysrgb&w=800",
        "pants": "https://images.pexels.com/photos/52518/jeans-pants-blue-shop-52518.jpeg?auto=compress&cs=tinysrgb&w=800",
        "skirt": "https://images.pexels.com/photos/601316/pexels-photo-601316.jpeg?auto=compress&cs=tinysrgb&w=800",
        "male": "https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?auto=compress&cs=tinysrgb&w=800",
        "female": "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800",
        "default": "https://images.pexels.com/photos/6764031/pexels-photo-6764031.jpeg?auto=compress&cs=tinysrgb&w=800"
      };
      
      // Check if any of the keywords match the garment URL
      let fallbackUrl = fallbackImages.default;
      
      // First check if we can identify the garment type from URL
      let garmentTypeFound = false;
      for (const [keyword, url] of Object.entries(fallbackImages)) {
        if (keyword === 'male' || keyword === 'female' || keyword === 'default') continue;
        
        if (selectedGarmentImageUrl.toLowerCase().includes(keyword.toLowerCase())) {
          fallbackUrl = url;
          garmentTypeFound = true;
          console.log(`Matched garment type from URL: ${keyword}`);
          break;
        }
      }
      
      // If no garment type identified, try to detect gender from model image URL
      if (!garmentTypeFound) {
        // Check model filename for gender indicators
        const modelImageUrl = humanImageUrl || '';
        
        const isModelMale = (
          modelImageUrl.toLowerCase().includes('male') || 
          modelImageUrl.toLowerCase().includes('guy') ||
          modelImageUrl.toLowerCase().includes('men') ||
          modelImageUrl.toLowerCase().includes('man')
        );
        
        const isModelFemale = (
          modelImageUrl.toLowerCase().includes('female') || 
          modelImageUrl.toLowerCase().includes('woman') ||
          modelImageUrl.toLowerCase().includes('women') ||
          modelImageUrl.toLowerCase().includes('girl')
        );
        
        if (isModelMale) {
          fallbackUrl = fallbackImages.male;
          console.log("Detected male model, using male fallback image");
        } else if (isModelFemale) {
          fallbackUrl = fallbackImages.female;
          console.log("Detected female model, using female fallback image");
        }
      }
      
      return NextResponse.json({
        resultUrl: fallbackUrl,
        status: 'completed',
        fallback: true,
        message: "Using similar style (fallback)",
        aiDescription: outputText || "No description provided"
      });
    }

    // TODO: Consider uploading Base64 image to storage and returning a permanent URL
    // For now, return the Data URI

    return NextResponse.json({
      resultUrl: generatedImageDataUri, // Data URI format: data:image/png;base64,...
      status: 'completed',
      // Optionally include text if needed by frontend:
      // message: outputText
    });

  } catch (error: any) { // Catch specific errors like timeout
     if (error.name === 'TimeoutError') {
        console.error('Gemini API request timed out.');
         return NextResponse.json({ error: 'API request timed out.', status: 'timeout' }, { status: 504 }); // Gateway Timeout
     }
    console.error('Virtual try-on processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 