// components/nfts/PublishForm.tsx
'use client';

import * as React from 'react';
import Textarea from '@/components/ui/Textarea';

export type PublishDraft = { content: string };

type Props = {
  onSubmit?: (draft: PublishDraft) => void;
  defaultValue?: string;
};

export default function PublishForm({ onSubmit, defaultValue = '' }: Props) {
  const [content, setContent] = React.useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ content });
      }}
      className="space-y-4 pt-0.5"
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Describe your NFT idea, traits, story... (this will be used for minting)"
        className="
          h-52 md:h-64
          resize-none
          bg-black/80 text-white placeholder-white/50
          border border-white/20
          focus:outline-none focus:ring-2 focus:ring-white/30
          rounded-2xl
        "
      />
      {/* 按钮在外层弹窗 footer */}
    </form>
  );
}