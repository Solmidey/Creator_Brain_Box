export const runtime = "nodejs";

import { SYSTEM_PROMPT } from "./prompt";
import type { HelperRequest } from "./prompt";

type ChatCompletionMessageParam = {
  role: "system" | "user" | "assistant";
  content: string;
};

const MODEL = process.env.OPENAI_MODEL || "llama-3.1-8b-instant";

async function fetchTweetSnippets(urls: string[]): Promise<string> {
  const results: string[] = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) continue;
      const html = await res.text();

      const match =
        html.match(/property="og:description" content="([^"]+)"/) ??
        html.match(/name="description" content="([^"]+)"/);

      if (match && match[1]) {
        results.push(`Tweet at ${url}: ${match[1]}`);
      } else {
        results.push(
          `Tweet at ${url}: (content could not be extracted, use the URL as reference)`,
        );
      }
    } catch (err) {
      console.warn("[/api/helper] Failed to fetch tweet", url, err);
    }
  }

  return results.join("\n");
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    console.log("[/api/helper] incoming request");

    if (!apiKey) {
      console.error("[/api/helper] Missing OPENAI_API_KEY");
      return Response.json(
        { error: "AI helper is not configured (missing OPENAI_API_KEY)." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as HelperRequest;

    const {
      mode,
      platform,
      ideaText,
      contentType,
      energy,
      referenceTweets = [],
      attachmentsSummary = "",
    } = body;

    if (!body || !ideaText || !ideaText.trim()) {
      console.warn("[/api/helper] Missing idea text");
      return Response.json({ error: "Missing idea text." }, { status: 400 });
    }

    let tweetContext = "";
    if (referenceTweets.length > 0) {
      tweetContext = await fetchTweetSnippets(referenceTweets);
    }

    const contextParts: string[] = [];
    if (attachmentsSummary) contextParts.push(`MEDIA/FILES:\n${attachmentsSummary}`);
    if (tweetContext) contextParts.push(`TWEETS:\n${tweetContext}`);

    const fullContext = contextParts.join("\n\n");

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: [
          "You are a content helper for social media ideas.",
          "You ALWAYS consider any reference tweets or media summaries provided as context.",
          "Use them to keep facts consistent, but write in the user’s own voice.",
          SYSTEM_PROMPT,
        ].join(" "),
      },
      {
        role: "user",
        content: [
          `Mode: ${mode}`,
          `Platform: ${platform}`,
          `Content type: ${contentType}`,
          `Energy level: ${energy}`,
          fullContext ? `Context:\n${fullContext}` : "",
          "",
          `Idea text:\n${ideaText}`,
          "",
          "Based on the context and the idea text, generate the requested content or suggestion.",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ];

    console.log("[/api/helper] Calling Groq model:", MODEL);

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 600,
        }),
      }
    );

    if (!groqRes.ok) {
      const text = await groqRes.text();
      console.error(
        "[/api/helper] Groq error",
        groqRes.status,
        groqRes.statusText,
        text
      );
      return Response.json(
        { error: "Upstream AI error. Please try again later." },
        { status: 502 }
      );
    }

    const data = (await groqRes.json()) as any;

    const suggestion: string =
      data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!suggestion) {
      console.error("[/api/helper] Empty suggestion from Groq:", data);
      return Response.json(
        { error: "AI returned an empty response." },
        { status: 500 }
      );
    }

    console.log("[/api/helper] Success, sending suggestion back");
    return Response.json({ suggestion });
  } catch (err) {
    console.error("[/api/helper] Unexpected error:", err);
    return Response.json(
      { error: "Unexpected error while generating suggestion." },
      { status: 500 }
    );
  }
}
