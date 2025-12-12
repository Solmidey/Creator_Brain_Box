export const SYSTEM_PROMPT = `
You are a social media writing assistant for online creators.

Your job:
- Help users turn rough ideas into strong posts for X (Twitter), LinkedIn, Instagram, or email newsletters.
- Keep their original intent and personality.
- Sound natural and human, not like a generic AI or corporate copywriter.

Style rules:
- Use simple, clear language. Avoid buzzwords and cringe “LinkedIn guru” tone.
- Vary sentence length. Mix short punchy lines with slightly longer ones.
- Use emojis sparingly (0–3 max) where it feels natural; never one per line.
- Respect the target platform:
  - X: short, high-signal, skimmable. 280 characters per tweet max.
  - LinkedIn: 3–8 short paragraphs, blank lines for spacing, clear hook at the top.
  - Instagram caption: conversational, a bit more emotional, 2–6 short paragraphs.
  - Newsletter: more complete explanations, but still approachable and human.

Content rules:
- Never invent fake facts. If reference tweets are provided, use them as inspiration or backing, but DO NOT copy them word-for-word.
- Paraphrase: put ideas into fresh language that feels like a real person speaking.
- If you’re unsure about specific details, stay general instead of hallucinating.
- Mention supporting info in natural language (“A recent tweet highlighted…”) instead of spamming links.
- Do not explain what you are doing in the final answer. Output only the requested post / hooks / thread / outline.
`;

export type HelperMode =
  | "polish"
  | "x_thread"
  | "linkedin_post"
  | "hooks"
  | "outline";

export type HelperPlatform = "x" | "linkedin" | "instagram" | "newsletter";

export interface HelperRequest {
  mode: HelperMode;
  platform: HelperPlatform;
  ideaText: string;
  contentType: "hook" | "thread" | "carousel" | "email" | "script" | "other";
  energy: 1 | 2 | 3 | 4 | 5;
  referenceTweets?: string[];   // tweet URLs backing the content
  attachmentsSummary?: string;  // e.g. "2 screenshots, 1 short video"
}

export function buildHelperPrompt(input: HelperRequest): string {
  const {
    mode,
    platform,
    ideaText,
    contentType,
    energy,
    referenceTweets = [],
    attachmentsSummary,
  } = input;

  const platformLabel =
    platform === "x"
      ? "X (Twitter)"
      : platform === "linkedin"
      ? "LinkedIn"
      : platform === "instagram"
      ? "Instagram"
      : "email newsletter";

  const refsText =
    referenceTweets.length > 0
      ? `\n\nSupporting tweet URLs (use them only as background context, do NOT copy them directly):\n${referenceTweets
          .map((url, i) => `  [${i + 1}] ${url}`)
          .join("\n")}`
      : "";

  const mediaText = attachmentsSummary
    ? `\n\nMedia attached to this post: ${attachmentsSummary}.
You can suggest how the copy should work with this media (for example: "the first image shows...", "the short video explains..."), but do NOT describe it in extreme detail.`
    : "";

  const baseContext = `User platform: ${platformLabel}
Planned content type: ${contentType}
User energy level (1-5): ${energy}

User's raw idea / draft:
"""
${ideaText}
"""${refsText}${mediaText}
`;

  switch (mode) {
    case "polish":
      return (
        baseContext +
        `
Task: Rewrite this into a stronger, clearer ${platformLabel} post while keeping the user's voice and intent.

Requirements:
- Keep roughly the same length (or slightly shorter) for ${platformLabel}.
- Keep any important details or opinions the user includes.
- Make it easy to skim: short sentences, clear structure, good spacing.
- Do NOT say "Here is your post" or add explanations. Output ONLY the final post.
- For X: stay within 280 characters.
- For LinkedIn: start with a strong hook line, then 3–7 short paragraphs with blank lines between them, and (optionally) 2–4 relevant hashtags at the bottom.
- For Instagram: 2–6 short paragraphs, optional CTA, 2–5 relevant hashtags at the end.
- For newsletter: 3–7 short paragraphs; no hashtags.

Now output the polished post only.
`
      );

    case "x_thread":
      return (
        baseContext +
        `
Task: Turn this into a concise X thread.

Requirements:
- Write 5–10 tweets.
- Each tweet must be <= 260 characters.
- Number them like "1/", "2/", etc. at the start of each tweet.
- Focus on clarity and flow; each tweet should stand alone but also connect to the previous one.
- Include optional CTAs or summaries near the end if it feels natural.
- Do NOT say "Here is your thread" or explain anything. Output ONLY the thread lines, one tweet per line, with a blank line between tweets.

Now output the X thread.
`
      );

    case "linkedin_post":
      return (
        baseContext +
        `
Task: Turn this into a LinkedIn-style post.

Requirements:
- Start with a strong hook line that would make the ideal audience stop scrolling.
- Then write 3–8 short paragraphs with blank lines between them.
- Keep the tone human, honest, and non-cringe. Avoid overused "LinkedIn influencer" clichés.
- It should feel like a real person writing about their experience or insight, not an AI.
- At the end, you may add 2–5 relevant hashtags on a separate line.
- Do NOT add any explanations. Output ONLY the LinkedIn post text.

Now output the LinkedIn post.
`
      );

    case "hooks":
      return (
        baseContext +
        `
Task: Generate 5 alternative hook options for this idea for ${platformLabel}.

Requirements:
- Output 5 hooks, numbered 1–5.
- Each hook should stand on its own.
- Keep each hook under 120 characters.
- Make them specific and intriguing, not clickbait or vague.
- Adapt tone to ${platformLabel} (slightly punchier for X, slightly more explanatory for LinkedIn).
- Do NOT explain your choices. Output ONLY the 5 hooks.

Now output the 5 hooks.
`
      );

    case "outline":
      return (
        baseContext +
        `
Task: Turn this raw idea into a clear content outline.

Requirements:
- First, write 1–2 sentences summarizing the core message.
- Then provide a structured outline tailored for ${platformLabel}, with sections like:
  - Hook
  - Main points (2–5 bullet points)
  - Example or story (optional)
  - CTA (call-to-action)
- Use simple bullet points and short phrases.
- This is an outline, not a full post.
- Do NOT explain what you are doing. Output ONLY the outline.

Now output the outline.
`
      );

    default:
      return (
        baseContext +
        `
Task: Polish and slightly improve this text for ${platformLabel}, keeping the user's voice. Output only the improved text.
`
      );
  }
}
