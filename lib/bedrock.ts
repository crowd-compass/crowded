import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai';

const bedrockProvider = createAmazonBedrock({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
});

export type CongestionStatus = 'empty' | 'few people' | 'moderate' | 'full';

export interface AnalysisResult {
  status: CongestionStatus;
  capacity: number;
  confidence: number;
  reasoning: string;
}

export async function analyzeCarriageImage(imageUrl: string): Promise<AnalysisResult> {
  try {
    const prompt = `You are an AI assistant analyzing train carriage occupancy. Analyze this image and determine:

1. The congestion status (choose ONE):
   - "empty": 0-25% capacity, very few or no people visible
   - "few people": 25-50% capacity, some people but plenty of space
   - "moderate": 50-85% capacity, many people but still some standing room
   - "full": 85-100%+ capacity, crowded with little to no space

2. Estimate the capacity percentage (0-150%, where >100% means over capacity)

3. Your confidence level (0-100%)

4. Brief reasoning for your assessment

Respond ONLY with a JSON object in this exact format:
{
  "status": "empty|few people|moderate|full",
  "capacity": <number 0-150>,
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation>"
}`;

    // Handle both regular URLs and base64 data URLs
    let imageInput: URL | Uint8Array;
    if (imageUrl.startsWith('data:')) {
      // Convert base64 to Uint8Array
      const base64Data = imageUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageInput = bytes;
    } else {
      imageInput = new URL(imageUrl);
    }

    const { text } = await generateText({
      model: bedrockProvider('us.meta.llama3-2-90b-instruct-v1:0'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: imageInput,
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      temperature: 0.3,
      maxTokens: 1000,
    });

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate and return
    return {
      status: result.status || 'moderate',
      capacity: Math.min(150, Math.max(0, result.capacity || 50)),
      confidence: Math.min(100, Math.max(0, result.confidence || 70)),
      reasoning: result.reasoning || 'Analysis completed',
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    // Return fallback result
    return {
      status: 'moderate',
      capacity: 50,
      confidence: 0,
      reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
