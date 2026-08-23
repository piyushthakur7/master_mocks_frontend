"use client";

import React from "react";

/**
 * Detects whether an authored string is real HTML markup or plain text that
 * was typed into a textarea (where line breaks carry the structure).
 */
const HTML_TAG_RE = /<\/?(p|br|ul|ol|li|div|span|strong|b|em|i|u|sub|sup|table|tr|td|th|img|h[1-6]|pre|code|blockquote)\b[^>]*>/i;

export function isHtmlContent(value: string) {
  return HTML_TAG_RE.test(value);
}

interface RichTextProps {
  /** Authored content: either HTML markup or plain text with line breaks. */
  content?: string | null;
  className?: string;
  /** Render inline (span) instead of a block-level div. */
  inline?: boolean;
}

/**
 * Renders admin-authored content so that manually numbered / bulleted lines
 * ("1. ...", "2. ...", "- ...") stay on their own lines instead of collapsing
 * into a single paragraph, while still allowing HTML styling when the source
 * actually contains markup.
 */
export default function RichText({ content, className = "", inline = false }: RichTextProps) {
  const text = content ?? "";
  const Tag = (inline ? "span" : "div") as React.ElementType;

  if (isHtmlContent(text)) {
    return (
      <Tag
        className={`rich-text ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  return <Tag className={`rich-text rich-text--plain ${className}`.trim()}>{text}</Tag>;
}
