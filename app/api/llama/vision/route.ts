import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "user" | "assistant";
  content: Array<{
    type: "text" | "image";
    text?: string;
    source?: {
      type: "base64";
      media_type: string;
      data: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      imageUrl,
      imageBase64,
      mimeType = "image/jpeg",
      modelId = "us.meta.llama3-2-90b-instruct-v1:0",
      maxTokens = 512,
      temperature = 0.5,
      topP = 0.9,
      region = "us-east-1"
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: "Either imageUrl or imageBase64 is required" },
        { status: 400 }
      );
    }

    // Create a Bedrock Runtime client
    const client = new BedrockRuntimeClient({
      region: region
    });

    let base64Image = imageBase64;

    // If imageUrl is provided, fetch and convert to base64
    if (imageUrl && !imageBase64) {
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString('base64');
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to fetch image from URL",
            details: error instanceof Error ? error.message : String(error)
          },
          { status: 400 }
        );
      }
    }

    // Build the message with image and text
    const messages: Message[] = [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: base64Image
            }
          },
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ];

    // Prepare the request payload for Llama 3.2 Vision
    // Llama 3.2 Vision uses a prompt-based format with images
    // The prompt must include <|image|> token for each image
    // Enhanced prompt to ensure JSON output
    const enhancedPrompt = `${prompt}\n\nIMPORTANT: You must respond with ONLY a valid JSON object, no additional text before or after. Use this exact format:\n{"capacity_percentage": <number>, "people_count": <number>, "vacant_regular_seat_num": <number>, "vacant_senior_seat_num": <number>}`;
    const visionPrompt = `<|image|>\n${enhancedPrompt}`;

    const payload = {
      prompt: visionPrompt,
      images: [base64Image],
      max_gen_len: maxTokens,
      temperature: temperature,
      top_p: topP
    };

    // Create the command
    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload)
    });

    // Invoke the model
    const response = await client.send(command);

    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const generation = responseBody.generation;

    // Try to extract structured data from the response
    let structuredData = null;

    // Clean the generation text to help with JSON extraction
    let cleanedGeneration = generation.trim();

    // Try multiple strategies to extract JSON
    try {
      // Strategy 1: Try to parse the entire response as JSON
      structuredData = JSON.parse(cleanedGeneration);
    } catch (e) {
      try {
        // Strategy 2: Look for JSON object in the response (handles extra text)
        const jsonMatch = cleanedGeneration.match(/\{[^{}]*"capacity_percentage"[^{}]*\}/);
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[0]);
        }
      } catch (e2) {
        try {
          // Strategy 3: Find the first complete JSON object
          const firstBrace = cleanedGeneration.indexOf('{');
          const lastBrace = cleanedGeneration.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonStr = cleanedGeneration.substring(firstBrace, lastBrace + 1);
            structuredData = JSON.parse(jsonStr);
          }
        } catch (e3) {
          // Strategy 4: If all JSON parsing fails, try to extract data from text
          const capacityMatch = cleanedGeneration.match(/capacity_percentage[:\s]+(\d+)/i);
          const peopleMatch = cleanedGeneration.match(/people_count[:\s]+(\d+)/i);
          const normalSeatsMatch = cleanedGeneration.match(/(?:normal_free_seat_num|vacant_regular_seat_num)[:\s]+(\d+)/i);
          const seniorSeatsMatch = cleanedGeneration.match(/(?:senior_seat_num|vacant_senior_seat_num)[:\s]+(\d+)/i);

          if (capacityMatch || peopleMatch || normalSeatsMatch || seniorSeatsMatch) {
            structuredData = {
              capacity_percentage: capacityMatch ? parseInt(capacityMatch[1]) : null,
              people_count: peopleMatch ? parseInt(peopleMatch[1]) : null,
              vacant_regular_seat_num: normalSeatsMatch ? parseInt(normalSeatsMatch[1]) : null,
              vacant_senior_seat_num: seniorSeatsMatch ? parseInt(seniorSeatsMatch[1]) : null
            };
          }
        }
      }
    }

    // Normalize field names if the model returned old field names
    if (structuredData) {
      if ('normal_free_seat_num' in structuredData && !('vacant_regular_seat_num' in structuredData)) {
        structuredData.vacant_regular_seat_num = structuredData.normal_free_seat_num;
        delete structuredData.normal_free_seat_num;
      }
      if ('senior_seat_num' in structuredData && !('vacant_senior_seat_num' in structuredData)) {
        structuredData.vacant_senior_seat_num = structuredData.senior_seat_num;
        delete structuredData.senior_seat_num;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        generation: generation,
        structuredData: structuredData,
        promptTokenCount: responseBody.prompt_token_count,
        generationTokenCount: responseBody.generation_token_count,
        stopReason: responseBody.stop_reason
      }
    });

  } catch (error) {
    console.error("Error invoking Bedrock vision model:", error);
    return NextResponse.json(
      {
        error: "Failed to invoke Bedrock vision model",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

