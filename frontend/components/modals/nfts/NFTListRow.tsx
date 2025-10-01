"use client";

import * as React from "react";
import Button from "@/components/ui/Button";
import type { NFTBasic } from "./NFTCard";

type Props = {
  item: NFTBasic;
  onClick?: (id: string) => void; // 点击整行（打开详情）
  onBuy?: (id: string) => void; // 点击右侧 BUY
};

export default function NFTListRow({ item, onClick, onBuy }: Props) {
  return (
    <button
      onClick={() => onClick?.(item.id)}
      className="w-full text-left group"
    >
      <div
        className="
          flex items-center justify-between gap-4
          rounded-2xl
          bg-white/7 border border-white/14 backdrop-blur-md
          px-4 py-3
          hover:bg-white/9 hover:border-white/25 transition-colors
        "
      >
        {/* 左：价格标签（按钮风格、不可点击） */}
        <div className="shrink-0">
          <Button
            appearance="glass"
            size="sm"
            disabled
            className="rounded-2xl px-3 py-1 cursor-default"
          >
            {item.currency ?? "$"} {item.price}
          </Button>
        </div>

        {/* 中：内容（透明、无边框） */}
        <div className="flex-1 min-w-0 text-white/85">
          <div className="truncate">{item.title}</div>
        </div>

        {/* 右：BUY（单独点击，不触发整行 onClick） */}
        <div className="shrink-0">
          <Button
            appearance="brand"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              onBuy?.(item.id);
            }}
          >
            BUY
          </Button>
        </div>
      </div>
    </button>
  );
}
