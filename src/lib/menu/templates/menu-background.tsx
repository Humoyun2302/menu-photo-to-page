import type { CSSProperties, ReactNode } from "react";

interface MenuBackgroundProps {
  backgroundImageUrl?: string;
  fallbackClassName: string;
  overlayClassName?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function MenuBackground({
  backgroundImageUrl,
  fallbackClassName,
  overlayClassName = "bg-black/60",
  className = "",
  style,
  children,
}: MenuBackgroundProps) {
  if (!backgroundImageUrl) {
    return (
      <div className={`${fallbackClassName} ${className}`.trim()} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen bg-cover bg-center bg-fixed ${className}`.trim()}
      style={{
        ...style,
        backgroundImage: `url(${backgroundImageUrl})`,
      }}
    >
      <div className={`absolute inset-0 ${overlayClassName}`} aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}
