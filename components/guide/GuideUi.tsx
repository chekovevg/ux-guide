import clsx from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

type GuideButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type GuideDivProps = HTMLAttributes<HTMLDivElement>;
type GuideKbdProps = HTMLAttributes<HTMLElement>;
type GuideBadgeProps = HTMLAttributes<HTMLSpanElement>;

export function GuideButton({
  className,
  type = "button",
  ...props
}: GuideButtonProps) {
  return (
    <button
      className={clsx("guide-button", className)}
      type={type}
      {...props}
    />
  );
}

export function GuideIconButton({
  className,
  type = "button",
  ...props
}: GuideButtonProps) {
  return (
    <button
      className={clsx("guide-icon-button", className)}
      type={type}
      {...props}
    />
  );
}

export function GuideSearchTrigger({
  className,
  type = "button",
  ...props
}: GuideButtonProps) {
  return (
    <button
      className={clsx("guide-search-trigger", className)}
      type={type}
      {...props}
    />
  );
}

export function GuideSurface({ className, ...props }: GuideDivProps) {
  return <div className={clsx("guide-surface", className)} {...props} />;
}

export function GuideCard({ className, ...props }: GuideDivProps) {
  return <div className={clsx("guide-card", className)} {...props} />;
}

export function GuideKbd({ className, ...props }: GuideKbdProps) {
  return <kbd className={clsx("guide-kbd", className)} {...props} />;
}

export function GuideBadge({ className, ...props }: GuideBadgeProps) {
  return <span className={clsx("guide-badge", className)} {...props} />;
}
