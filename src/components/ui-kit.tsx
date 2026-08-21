import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function PageHero({
  title,
  subtitle,
  crumb,
}: {
  title: string;
  subtitle?: string;
  crumb: string;
}) {
  return (
    <section className="border-b border-gold/60 bg-primary-deep">
      <div className="container-page py-7.5 text-center sm:py-9">
        <nav aria-label="Breadcrumb" className="text-xs text-gold">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2 opacity-60">/</span>
          <span className="opacity-90">{crumb}</span>
        </nav>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/80">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}

export function Section({
  children,
  className,
  muted,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section className={cn(muted && "bg-muted/60", className)}>
      <div className="container-page py-12 sm:py-16">{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "gold" | "muted" | "danger" | "success";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/20 text-gold-foreground",
    muted: "bg-muted text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
    success: "bg-success/15 text-success",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "gold" | "outline" | "ghost";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-deep",
    gold: "bg-gold text-gold-foreground hover:brightness-105",
    outline: "border border-primary/30 text-primary hover:bg-primary/5",
    ghost: "text-primary hover:bg-primary/5",
  } as const;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string | undefined;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-semibold text-foreground">
        {label}
      </span>

      {children}

      {hint ? (
        <span className="mt-1.5 block text-sm font-semibold text-red-600">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
export const inputClass =
  "w-full rounded-lg border border-input bg-secondary/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-card";
