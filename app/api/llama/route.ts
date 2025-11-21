import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      modelId = "meta.llama3-70b-instruct-v1:0",
      maxTokens = 512,
      temperature = 0.5,
      topP = 0.9,
      region = "us-west-2"
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Create a Bedrock Runtime client
    const client = new BedrockRuntimeClient({
      region: region
    });

    // Format the prompt using Llama 3's special format
    const prompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>
${message}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>`;

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
