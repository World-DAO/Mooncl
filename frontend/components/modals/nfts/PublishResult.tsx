// components/nfts/PublishResult.tsx
'use client';

import * as React from 'react';
import Button from '@/components/ui/Button';

type Props = {
  score: number;                 // 分数（0~100）
  onConfirm?: () => void;        // 点击彩色按钮
};

export default function PublishResult({ score, onConfirm }: Props) {
  return (
    <div className="text-center space-y-6">
      <div className="text-2xl font-semibold text-white">Your Score</div>
      <div className="text-[56px] leading-none font-extrabold text-white">{score}</div>
      <div className="text-white/60">AI has evaluated your content.</div>
      <div className="pt-2">
        <Button appearance="brand" size="lg" onClick={onConfirm}>
          OK
        </Button>
      </div>
    </div>
  );
}