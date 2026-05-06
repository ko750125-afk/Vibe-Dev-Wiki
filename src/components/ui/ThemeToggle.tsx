"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { cn } from "@/lib/utils";

const BRANDS = [
  { id: 'light', name: 'Apple', icon: '/themes/apple_v2.png', border: '#8C8379' },
  { id: 'starbucks', name: 'Starbucks', icon: '/themes/starbucks_v2.png', border: '#00704A' },
  { id: 'lego', name: 'Lego', icon: '/themes/lego_v2.png', border: '#E3000B' },
  { id: 'netflix', name: 'Netflix', icon: '/themes/netflix_v3.png', border: '#E50914' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-[200px] rounded-2xl bg-accent/20 animate-pulse border border-border/50" />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 bg-accent/10 p-2.5 rounded-3xl w-14 border border-border/50 shadow-sm">
      {BRANDS.map((brand) => {
        const isActive = theme === brand.id;
        return (
          <button
            key={brand.id}
            onClick={() => setTheme(brand.id)}
            className={cn(
              "relative w-9 h-9 rounded-full overflow-hidden transition-all duration-300",
              isActive 
                ? "shadow-md scale-110 ring-2 ring-offset-2 ring-offset-background" 
                : "opacity-50 hover:opacity-100 hover:scale-105 scale-95 grayscale-[30%] hover:grayscale-0"
            )}
            style={{
              "--tw-ring-color": isActive ? brand.border : 'transparent',
            } as React.CSSProperties}
            aria-label={`${brand.name} Theme`}
            title={brand.name}
          >
            <Image
              src={brand.icon}
              alt={brand.name}
              fill
              className="object-cover"
              sizes="36px"
            />
          </button>
        );
      })}
    </div>
  );
}
