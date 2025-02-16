import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.OPENAI_API_KEY,
  // custom settings
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash-001"),
    messages,
  });

  console.log(result);

  return result.toDataStreamResponse();
}
