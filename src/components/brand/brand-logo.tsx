import Image from "next/image";
import type { ComponentProps } from "react";

export type BrandLogoVariant =
  | "horizontal"
  | "vertical"
  | "horizontal-slogan"
  | "vertical-slogan";

export type BrandLogoColor = "color" | "blanco" | "navy" | "negativo" | "negro";

export interface BrandLogoProps
  extends Omit<ComponentProps<typeof Image>, "src" | "alt"> {
  variant?: BrandLogoVariant;
  color?: BrandLogoColor;
  alt?: string;
}

function getLogoSrc(variant: BrandLogoVariant, color: BrandLogoColor): string {
  if (variant === "horizontal-slogan") {
    const sloganColor = color === "negativo" || color === "blanco" ? "negativo" : "color";
    return `/brand/logos_SVG/logo_horizontal_eslogan_${sloganColor}.svg`;
  }
  if (variant === "vertical-slogan") {
    const sloganColor = color === "negativo" || color === "blanco" ? "negativo" : "color";
    return `/brand/logos_SVG/logo_vertical_eslogan_${sloganColor}.svg`;
  }
  if (variant === "vertical") {
    return `/brand/logos_SVG/logo_vertical_${color}.svg`;
  }
  return `/brand/logos_SVG/logo_horizontal_${color}.svg`;
}

export function BrandLogo({
  variant = "horizontal",
  color = "color",
  alt = "ManosCerca",
  width,
  height,
  className,
  priority = false,
  ...props
}: BrandLogoProps) {
  const src = getLogoSrc(variant, color);

  // Dimensiones por defecto según proporción del manual de identidad
  const defaultDimensions = {
    horizontal: { width: 140, height: 40 },
    vertical: { width: 120, height: 74 },
    "horizontal-slogan": { width: 180, height: 52 },
    "vertical-slogan": { width: 140, height: 86 },
  }[variant];

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? defaultDimensions.width}
      height={height ?? defaultDimensions.height}
      priority={priority}
      unoptimized
      className={className}
      {...props}
    />
  );
}
