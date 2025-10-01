// components/nfts/NFTCard.tsx
"use client";

import * as React from "react";
import GradientRing from "@/components/ui/GradientRing";
import { cn } from "@/lib/utils";

export type NFTBasic = {
  id: string;
  title: string;
  image?: string;
  price?: number;
  currency?: string;
};

interface Props {
  item: NFTBasic;
  selected?: boolean;
  onClick?: (id: string) => void;
}

export default function NFTCard({ item, selected, onClick }: Props) {
  const cardInner = (
    <div
      className={cn(
        "rounded-2xl overflow-hidden bg-white/6 border border-white/10 backdrop-blur-md",
        "hover:bg-white/8 transition-colors"
      )}
    >
      <div className="aspect-[4/3] bg-black/20">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3">
        <div className="text-white/90 font-medium truncate">{item.title}</div>
        {item.price != null && (
          <div className="mt-1 text-sm text-white/60">
            {item.price} {item.currency ?? "$"}
          </div>
        )}
      </div>
    </div>
  );

  // 选中：始终显示彩色描边
  //   if (selected) {
  //     return (
  //       <GradientRing radius="1rem" padding={1}>
  //         <button className="w-full text-left" onClick={() => onClick?.(item.id)}>
  //           {cardInner}
  //         </button>
  //       </GradientRing>
  //     );
  //   }

  // 未选中：hover 时显示彩色描边（保持高亮背景）
  return (
    <button
      className="w-full text-left group relative"
      onClick={() => onClick?.(item.id)}
    >
      {/* 彩色描边（默认透明，hover 显示） */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition"
        style={{
          padding: 1,
          background: "var(--gradient-brand)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {cardInner}
    </button>
  );
}
