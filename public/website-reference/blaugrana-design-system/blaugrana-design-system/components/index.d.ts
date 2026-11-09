import type { ReactNode, ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Fill. primary = brand blue (white on dark sections), secondary = gold, tertiary = grey, outline = stroke, grana = ticketing/matchday. */
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "grana";
  size?: "s" | "m" | "l";
  /** Renders an <a> instead of a <button>. */
  href?: string;
  children?: ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;

export interface TagProps { tone?: "neutral" | "blue" | "grana" | "gold" | "live"; children?: ReactNode; className?: string; }
export declare function Tag(props: TagProps): JSX.Element;

export interface SectionHeaderProps { title: ReactNode; kicker?: string; linkLabel?: string; href?: string; className?: string; }
export declare function SectionHeader(props: SectionHeaderProps): JSX.Element;

export interface Team { name: string; short?: string; crestSrc?: string; }
export interface MatchCardProps {
  competition: string; home: Team; away: Team;
  status?: "upcoming" | "live" | "final";
  date?: string; time?: string; minute?: string;
  homeScore?: number; awayScore?: number;
  venue?: string; ctaLabel?: string; ctaHref?: string; className?: string;
}
export declare function MatchCard(props: MatchCardProps): JSX.Element;

export interface NewsCardProps {
  title: string; href?: string; imageSrc?: string; imageAlt?: string;
  category?: string; categoryTone?: TagProps["tone"]; meta?: string; className?: string;
}
export declare function NewsCard(props: NewsCardProps): JSX.Element;
