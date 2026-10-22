import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  width?: number;
  priority?: boolean;
};

export function BrandLogo({
  className = "w-[130px]",
  priority = false,
  width,
}: BrandLogoProps) {
  return (
    <Image
      alt="HomeLinq Properties"
      className={`h-auto object-contain ${className}`}
      height={793}
      priority={priority}
      src="/homepage/logo.png"
      style={width ? { height: "auto", width: `${width}px` } : undefined}
      width={1983}
    />
  );
}
