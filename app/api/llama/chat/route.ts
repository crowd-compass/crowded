import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      modelId = "meta.llama3-70b-instruct-v1:0",
      maxTokens = 512,
      temperature = 0.7,
      topP = 0.9,
      region = "us-west-2"
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Create a Bedrock Runtime client
    const client = new BedrockRuntimeClient({
      region: region
    });

    // Build the prompt with conversation history
    let prompt = "<|begin_of_text|>";
    for (const turn of messages) {
      if (turn.role === "user") {
        prompt += `<|start_header_id|>user<|end_header_id|>\n${turn.content}<|eot_id|>\n`;
      } else if (turn.role === "assistant") {
        prompt += `<|start_header_id|>assistant<|end_header_id|>\n${turn.content}<|eot_id|>\n`;
      }
    }
    prompt += "<|start_header_id|>assistant<|end_header_id|>";

    // Prepare the request payload
    const payload = {
      prompt: prompt,
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

    return NextResponse.json({
      success: true,
      data: {
        generation: responseBody.generation,
        promptTokenCount: responseBody.prompt_token_count,
        generationTokenCount: responseBody.generation_token_count,
        stopReason: responseBody.stop_reason
      }
    });

  } catch (error) {
    console.error("Error invoking Bedrock model:", error);
    return NextResponse.json(
      {
        error: "Failed to invoke Bedrock model",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
