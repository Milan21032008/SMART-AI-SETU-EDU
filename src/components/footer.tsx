"use client";

import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-8 mt-auto flex flex-col items-center justify-center gap-4 animate-fade-in relative z-0">
      <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity duration-500">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">
          Built with
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black tracking-tighter text-primary">SETU AI</span>
          <Heart className="size-2.5 text-destructive fill-current animate-pulse" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1 opacity-30 hover:opacity-100 transition-opacity duration-500">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-center px-4">
          &copy; 2026 SETU AI &bull; All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
