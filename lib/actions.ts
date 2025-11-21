'use server';

import { analyzeCarriageImage } from './bedrock';

export async function analyzeImage(imageUrl: string) {
  return await analyzeCarriageImage(imageUrl);
}
