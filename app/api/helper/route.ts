import { SYSTEM_PROMPT, buildHelperPrompt, HelperRequest } from "./prompt";

const MODEL = process.env.OPENAI_MODEL ?? "llama-3.1-8b-instant";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("AI helper is not configured: missing OPENAI_API_KEY.");
      return Response.json(
        { error: "AI helper is not configured (missing OPENAI_API_KEY)." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as HelperRequest;

    if (!body || !body.ideaText || !body.ideaText.trim()) {
      return Response.json({ error: "Missing idea text." }, { status: 400 });
    }

    const userPrompt = buildHelperPrompt(body);

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      }
    );

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("Helper upstream error:", groqRes.status, errorText);
      return Response.json(
        { error: "Upstream AI error. Please try again later." },
        { status: 502 }
      );
    }

    const data = (await groqRes.json()) as any;
    const suggestion = data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!suggestion) {
      return Response.json(
        { error: "AI returned an empty response." },
        { status: 500 }
      );
    }

    return Response.json({ suggestion });
  } catch (err) {
    console.error("Helper API error:", err);
    return Response.json(
      { error: "Unexpected error while generating suggestion." },
      { status: 500 }
    );
  }
}
