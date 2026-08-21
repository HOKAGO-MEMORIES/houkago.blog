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
  width?: number | string;
  height?: number | string;
};

type YouTubeProps = {
  id: string;
  title?: string;
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
    <aside className="post-callout" data-tone={tone}>
      <p className="post-callout-title">{title}</p>
      <div className="post-callout-body">
        {children}
      </div>
    </aside>
  );
}

export function Aside({ title = "Aside", children }: AsideProps) {
  return (
    <aside className="post-aside">
      <p className="post-aside-title">{title}</p>
      <div className="post-aside-body">
        {children}
      </div>
    </aside>
  );
}

function toImageDimension(value: number | string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : undefined;
}

export function ImageFigure({ src, alt, caption, width, height }: ImageFigureProps) {
  if (!isAllowedPublicMediaSource(src)) {
    return (
      <p className="post-media-error">
        ImageFigure does not allow relative asset paths. Use a root-relative public path or an
        absolute URL.
      </p>
    );
  }

  const imageWidth = toImageDimension(width);
  const imageHeight = toImageDimension(height);

  return (
    <figure className="post-image-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        className="post-image"
        loading="lazy"
        decoding="async"
      />
      {caption ? (
        <figcaption>
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
      <p className="post-media-error">
        YouTube requires a valid 11-character video id.
      </p>
    );
  }

  return (
    <div className="post-youtube">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${embedId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}

export const blogMDXComponents = {
  Callout,
  Aside,
  ImageFigure,
  YouTube,
};
