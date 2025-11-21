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
    const visionPrompt = `<|image|>\n${prompt}`;

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
    try {
      // Look for JSON in the response
      const jsonMatch = generation.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If JSON parsing fails, try to extract data from text
      const capacityMatch = generation.match(/capacity_percentage[:\s]+(\d+)/i);
      const peopleMatch = generation.match(/people_count[:\s]+(\d+)/i);
      const normalSeatsMatch = generation.match(/normal_free_seat_num[:\s]+(\d+)/i);
      const seniorSeatsMatch = generation.match(/senior_seat_num[:\s]+(\d+)/i);

      if (capacityMatch || peopleMatch || normalSeatsMatch || seniorSeatsMatch) {
        structuredData = {
          capacity_percentage: capacityMatch ? parseInt(capacityMatch[1]) : null,
          people_count: peopleMatch ? parseInt(peopleMatch[1]) : null,
          normal_free_seat_num: normalSeatsMatch ? parseInt(normalSeatsMatch[1]) : null,
          senior_seat_num: seniorSeatsMatch ? parseInt(seniorSeatsMatch[1]) : null
        };
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

