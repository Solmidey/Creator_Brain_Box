import { NextRequest, NextResponse } from "next/server";

type HelperRequestBody = {
  text: string;
  platforms?: string[];
  mode?: string;
  referenceTweets?: string[];
  contentType?: string;
  energy?: number;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HelperRequestBody;
  const { text, platforms = [], mode, referenceTweets = [], contentType, energy } = body;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI helper not configured" }, { status: 500 });
  }

  const prompt = `You are an expert content strategist. Based on the following idea, provide a concise suggestion. Idea: ${text}. Mode: ${mode}. Platforms: ${platforms.join(", ")}. Content type: ${contentType}. Energy: ${energy}. Reference tweets or context: ${referenceTweets.join(", ")}. Respond with a tight, high-signal suggestion ready to use.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: "Failed to generate suggestion", details: errorText }, { status: 500 });
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const suggestion = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Helper API error", error);
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
  }
}
