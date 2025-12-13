"use client";

import React from "react";
import type { IdeaAttachment } from "../types/ideas";

type Platform = "x" | "instagram" | "youtube" | "newsletter";

interface PlatformPreviewProps {
  platform: Platform;
  title: string;
  body: string;
  outline: string;
  attachments: IdeaAttachment[];
}

export function PlatformPreview(props: PlatformPreviewProps) {
  const { platform, title, body, outline, attachments } = props;

  if (platform === "x") {
    return <XPreview title={title} body={body} attachments={attachments} />;
  }

  if (platform === "instagram") {
    return (
      <InstagramPreview
        title={title}
        body={body}
        attachments={attachments}
      />
    );
  }

  if (platform === "youtube") {
    return (
      <YouTubePreview
        title={title}
        body={body}
        outline={outline}
        attachments={attachments}
      />
    );
  }

  return (
    <NewsletterPreview
      title={title}
      body={body}
      outline={outline}
      attachments={attachments}
    />
  );
}

function XPreview({
  title,
  body,
  attachments,
}: {
  title: string;
  body: string;
  attachments: IdeaAttachment[];
}) {
  const text = body || title;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-50 shadow-xl">
      <div className="mb-3 flex gap-3">
        <div className="h-9 w-9 rounded-full bg-slate-700" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold">Creator Brain</span>
            <span className="text-slate-400">@creatorbrain</span>
            <span className="text-slate-500">· now</span>
          </div>
          <div className="mt-2 space-y-3">
            {lines.length === 0 && (
              <p className="text-slate-500 text-sm">
                Your thread will appear here as you type…
              </p>
            )}
            {lines.map((line, idx) => (
              <p key={idx} className="whitespace-pre-wrap leading-relaxed">
                {lines.length > 1 ? `${idx + 1}/ ${line}` : line}
              </p>
            ))}
          </div>

          {attachments.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-slate-900/80 p-2">
              {attachments.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="h-24 rounded-xl bg-slate-800/80 text-[10px] text-slate-300 flex items-center justify-center text-center px-2"
                >
                  [{a.type}] {a.name ?? a.url}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InstagramPreview({
  title,
  body,
  attachments,
}: {
  title: string;
  body: string;
  attachments: IdeaAttachment[];
}) {
  const caption = body || title || "Your caption will appear here…";

  return (
    <div className="mx-auto w-full max-w-xs rounded-[2.5rem] border border-slate-800 bg-slate-950/90 p-3 shadow-2xl">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-slate-600" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-50">
            creator.brain
          </span>
          <span className="text-[10px] text-slate-500">Practice mode</span>
        </div>
      </div>

      <div className="relative mb-2 aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-900 to-slate-950 flex items-center justify-center">
        {attachments.length === 0 ? (
          <span className="text-[11px] text-slate-300">
            Add images or video to preview a post
          </span>
        ) : (
          <div className="grid h-full w-full grid-cols-2 gap-1 p-2">
            {attachments.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="rounded-xl bg-slate-800/90 text-[9px] text-slate-200 flex items-center justify-center text-center px-1"
              >
                [{a.type}] {a.name ?? a.url}
              </div>
            ))}
          </div>
        )}
        {attachments.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-slate-100 whitespace-pre-wrap">
          <span className="font-semibold mr-1">creator.brain</span>
          {caption}
        </p>
      </div>
    </div>
  );
}

function YouTubePreview({
  title,
  body,
  outline,
  attachments,
}: {
  title: string;
  body: string;
  outline: string;
  attachments: IdeaAttachment[];
}) {
  const displayTitle =
    title || (body.split("\n").find(Boolean) ?? "Your video title");
  const desc = (body || outline || "").slice(0, 220);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-50 shadow-xl">
      <div className="mb-3 aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/40 via-slate-900 to-slate-950 flex items-center justify-center">
        {attachments.length === 0 ? (
          <span className="text-[11px] text-slate-100">
            Add a video or image to simulate a thumbnail
          </span>
        ) : (
          <span className="text-[11px] text-slate-100">
            [{attachments[0].type}] {attachments[0].name ?? attachments[0].url}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold leading-snug">{displayTitle}</h3>
      <div className="mt-1 text-xs text-slate-400">
        Creator Brain · Practice channel
      </div>
      {desc && (
        <p className="mt-2 text-xs text-slate-300 whitespace-pre-wrap">
          {desc}
          {desc.length >= 220 && "…"}
        </p>
      )}
    </div>
  );
}

function NewsletterPreview({
  title,
  body,
  outline,
}: {
  title: string;
  body: string;
  outline: string;
  attachments: IdeaAttachment[];
}) {
  const subject = title || body.split("\n").find(Boolean) || "Your subject line";
  const content = body || outline || "Your email body will appear here…";

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <div className="mx-auto max-w-md rounded-2xl bg-slate-50 p-4 text-slate-900">
        <div className="mb-2 text-[11px] text-slate-500">
          From: <span className="font-medium">Creator Brain</span> &lt;you@example.com&gt;
        </div>
        <div className="mb-3 text-sm font-semibold">Subject: {subject}</div>
        <div className="h-px w-full bg-slate-200 mb-3" />
        <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}
