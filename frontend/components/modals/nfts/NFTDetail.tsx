// components/domain/nft/NFTDetail.tsx
// components/domain/nft/NFTDetail.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type NFTDetailData = {
  id: string;
  title: string;
  image?: string;
  desc?: string;
  price?: number;
  currency?: string;
  owner?: string;
};

interface Props {
  data?: NFTDetailData;
  className?: string;
  actions?: React.ReactNode; // 购买/返回按钮位
}

export default function NFTDetail({ data, className, actions }: Props) {
  if (!data) {
    return (
      <div className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  // 格式化价格（$xx.xx）
  const priceText =
    typeof data.price === "number"
      ? `${data.currency ?? "$"}${Number(data.price).toFixed(4)}`
      : undefined;

  // 缩写地址（0x1234…abcd）
  const shortOwner =
    data.owner && data.owner.length > 12
      ? `${data.owner.slice(0, 6)}…${data.owner.slice(-4)}`
      : data.owner || undefined;

  return (
    <div className={cn("w-full", className)}>
      {/* 顶部：大号价格 */}
      {priceText && (
        <div className="text-4xl md:text-5xl font-extrabold text-white">
          {priceText}
        </div>
      )}

      {/* 地址行（小图标 + 灰字） */}
      {shortOwner && (
        <div className="mt-3 text-white/70 text-sm flex items-center gap-2">
          {/* 小用户图标 */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="opacity-80"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 12c2.761 0 5-2.686 5-6S14.761 0 12 0 7 2.686 7 6s2.239 6 5 6Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" />
          </svg>
          <span className="tracking-wide">{shortOwner}</span>
        </div>
      )}

      {/* 中间描述文案：居中摆放（块居中，文本左对齐） */}
      {data.desc && (
        <div className="mt-8 md:mt-10 mx-auto max-w-[680px] text-white/90 text-base md:text-lg leading-8 text-left whitespace-pre-line">
          {data.desc}
        </div>
      )}

      {/* 预留 actions 位（一般不使用；按钮放到弹窗 footer） */}
      {actions && <div className="pt-6">{actions}</div>}
    </div>
  );
}