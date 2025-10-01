// components/nfts/PublishResult.tsx
'use client';

import * as React from 'react';
import Button from '@/components/ui/Button';

type Props = {
  score?: number;                 // 分数（0~100），不传则显示评估中的占位
  message?: string;               // 评估中的文案占位
  onConfirm?: () => void;         // 点击彩色按钮
};

export default function PublishResult({ score, message = 'Lisa is evaluating your opinion…', onConfirm }: Props) {
  const isScored = typeof score === 'number' && !Number.isNaN(score);
  return (
    <div className="text-center space-y-6">
      {isScored ? (
        <>
          <div className="text-2xl font-semibold text-white">Your Score</div>
          <div className="text-[56px] leading-none font-extrabold text-white">{score}</div>
          <div className="text-white/60">This is your preliminary evaluation, please wait for the final evaluation.</div>
          <div className="text-white/60">Lisa is evaluating, please wait.</div>
        </>
      ) : (
        <>
          <div className="text-2xl font-semibold text-white">Thanks!</div>
          <div className="flex items-center justify-center gap-3 text-white/85">
            <span className="w-5 h-5 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
            <span>{message}</span>
          </div>
        </>
      )}
      <div className="pt-2">
        <Button appearance="brand" size="lg" onClick={onConfirm}>
          OK
        </Button>
      </div>
    </div>
  );
}
