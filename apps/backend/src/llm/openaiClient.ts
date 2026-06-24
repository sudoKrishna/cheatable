import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const openai = new OpenAI({ apiKey });

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function streamExplanation(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<string> {
  const stream = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages,
    temperature: 0.2,
    stream: true
  });

  let full = "";
  for await (const part of stream) {
    const delta = part.choices[0]?.delta?.content;
    if (delta) {
      full += delta;
      onChunk(delta);
    }
  }

  if (!full) {
    throw new Error("OpenAI returned an empty explanation stream");
  }

  return full;
}

export async function callFileGenModel(messages: ChatMessage[]): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages,
    temperature: 0.2,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }
  return content;
}