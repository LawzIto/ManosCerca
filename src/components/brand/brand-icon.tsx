import Image from "next/image";
import type { ComponentProps } from "react";

export type BrandIconColor = "color" | "blanco" | "navy" | "negativo" | "negro";

export interface BrandIconProps
  extends Omit<ComponentProps<typeof Image>, "src" | "alt"> {
  color?: BrandIconColor;
  alt?: string;
}

function getIconSrc(color: BrandIconColor): string {
  return `/brand/logos_SVG/isotipo_${color}.svg`;
}

export function BrandIcon({
  color = "color",
  alt = "ManosCerca Isotipo",
  width = 32,
  height = 39,
  className,
  priority = false,
  ...props
}: BrandIconProps) {
  const src = getIconSrc(color);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={className}
      {...props}
    />
  );
}
