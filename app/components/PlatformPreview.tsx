/* eslint-disable @next/next/no-img-element */
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

function renderImageThumb(a: IdeaAttachment, className = "") {
  return (
    <img
      src={a.url}
      alt={a.name ?? "Uploaded image"}
      className={className || "h-full w-full object-cover rounded-xl"}
    />
  );
}

function renderVideoThumb(a: IdeaAttachment, className = "") {
  return (
    <video
      src={a.url}
      controls
      className={className || "h-full w-full object-cover rounded-xl"}
    />
  );
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
  const imageAttachments = attachments.filter((a) => a.type === "image");
  const videoAttachments = attachments.filter((a) => a.type === "video");

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

          {(imageAttachments.length > 0 || videoAttachments.length > 0) && (
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-slate-900/80 p-2">
              {imageAttachments.slice(0, 3).map((a) => (
                <div key={a.id} className="h-24 overflow-hidden rounded-xl">
                  {renderImageThumb(a)}
                </div>
              ))}
              {videoAttachments.slice(0, 1).map((a) => (
                <div key={a.id} className="col-span-2 h-24 overflow-hidden rounded-xl">
                  {renderVideoThumb(a)}
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
  const imageAttachments = attachments.filter((a) => a.type === "image");
  const videoAttachments = attachments.filter((a) => a.type === "video");
  const hasMedia = imageAttachments.length > 0 || videoAttachments.length > 0;

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
        {!hasMedia ? (
          <span className="text-[11px] text-slate-300 text-center px-4">
            Add images or video below to preview a carousel or reel.
          </span>
        ) : videoAttachments.length > 0 ? (
          <div className="h-full w-full overflow-hidden rounded-2xl">
            {renderVideoThumb(videoAttachments[0], "h-full w-full object-cover")}
          </div>
        ) : imageAttachments.length === 1 ? (
          <div className="h-full w-full overflow-hidden rounded-2xl">
            {renderImageThumb(imageAttachments[0], "h-full w-full object-cover")}
          </div>
        ) : (
          <div className="grid h-full w-full grid-cols-2 gap-1 p-2">
            {imageAttachments.slice(0, 3).map((a) => (
              <div key={a.id} className="overflow-hidden rounded-xl">
                {renderImageThumb(a, "h-full w-full object-cover")}
              </div>
            ))}
          </div>
        )}
        {imageAttachments.length > 1 && (
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
  const imageAttachments = attachments.filter((a) => a.type === "image");
  const videoAttachments = attachments.filter((a) => a.type === "video");

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-50 shadow-xl">
      <div className="mb-3 aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/40 via-slate-900 to-slate-950 flex items-center justify-center">
        {videoAttachments.length > 0 ? (
          renderVideoThumb(videoAttachments[0], "h-full w-full object-cover rounded-2xl")
        ) : imageAttachments.length > 0 ? (
          renderImageThumb(imageAttachments[0], "h-full w-full object-cover rounded-2xl")
        ) : (
          <span className="text-[11px] text-slate-100">
            Add a video or thumbnail image below to see it here.
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
  attachments,
}: {
  title: string;
  body: string;
  outline: string;
  attachments: IdeaAttachment[];
}) {
  const subject = title || body.split("\n").find(Boolean) || "Your subject line";
  const content = body || outline || "Your email body will appear here…";
  const imageAttachments = attachments.filter((a) => a.type === "image");

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <div className="mx-auto max-w-md rounded-2xl bg-slate-50 p-4 text-slate-900">
        {imageAttachments.length > 0 && (
          <div className="mb-3 overflow-hidden rounded-xl">
            {renderImageThumb(imageAttachments[0], "w-full max-h-48 object-cover")}
          </div>
        )}
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
