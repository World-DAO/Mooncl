// components/domain/nft/NFTList.tsx
'use client';

import * as React from 'react';
import NFTCard, { NFTBasic } from './NFTCard';

interface Props {
  items?: NFTBasic[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export default function NFTList({ items = [], selectedId, onSelect }: Props) {
  
  if (!items.length) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((it) => (
        <NFTCard
          key={it.id}
          item={it}
          selected={selectedId === it.id}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}