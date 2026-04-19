import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "danger";

type CalloutProps = {
  title?: string;
  tone?: Tone;
  children: ReactNode;
};

type AsideProps = {
  title?: string;
  children: ReactNode;
};

type ImageFigureProps = {
  src: string;
  alt: string;
  caption?: string;
};

type YouTubeProps = {
  id: string;
  title?: string;
};

const toneClasses: Record<Tone, string> = {
  info: "border-sky-400/60 bg-sky-100/70 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100",
  success: "border-emerald-400/60 bg-emerald-100/70 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning: "border-amber-400/60 bg-amber-100/80 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
  danger: "border-rose-400/60 bg-rose-100/80 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100",
};

function isAllowedPublicMediaSource(src: string) {
  return src.startsWith("/") || /^https?:\/\//i.test(src);
}

export function Callout({
  title = "Note",
  tone = "info",
  children,
}: CalloutProps) {
  return (
    <div className={`my-6 rounded-2xl border px-5 py-4 ${toneClasses[tone]}`}>
      <p className="m-0 text-sm font-bold uppercase tracking-[0.2em]">{title}</p>
      <div className="mt-3 text-sm leading-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}

export function Aside({ title = "Aside", children }: AsideProps) {
  return (
    <aside className="my-6 rounded-2xl border border-border/80 bg-muted/40 px-5 py-4">
      <p className="m-0 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {title}
      </p>
      <div className="mt-3 text-sm leading-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}

export function ImageFigure({ src, alt, caption }: ImageFigureProps) {
  if (!isAllowedPublicMediaSource(src)) {
    return (
      <p className="rounded-xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        ImageFigure does not allow relative asset paths. Use a public path such as
        {" "}
        <code>/generated/posts/...</code>
        {" "}
        or an absolute URL.
      </p>
    );
  }

  return (
    <figure className="my-8 flex flex-col gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full rounded-2xl border object-cover"
        loading="lazy"
      />
      {caption ? (
        <figcaption className="text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function YouTube({ id, title = "YouTube video" }: YouTubeProps) {
  const embedId = id.trim();

  if (!/^[A-Za-z0-9_-]{11}$/.test(embedId)) {
    return (
      <p className="rounded-xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        YouTube requires a valid 11-character video id.
      </p>
    );
  }

  return (
    <div className="my-8 overflow-hidden rounded-2xl border">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${embedId}`}
          title={title}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export const blogMDXComponents = {
  Callout,
  Aside,
  ImageFigure,
  YouTube,
};
