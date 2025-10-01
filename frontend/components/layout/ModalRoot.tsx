'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MarketModal from '@/components/modals/MarketModal';
import NFTDetailModal from '@/components/modals/NFTDetailModal'; // ✅ 默认导入
import PublishModal from '@/components/modals/PublishModal';

function pushParams(router: any, pathname: string, next: URLSearchParams) {
  const q = next.toString();
  router.push(q ? `${pathname}?${q}` : pathname);
}

export default function ModalRoot() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const modal = sp.get('modal');
  const nftId = sp.get('nft') ?? undefined;

  const close = () => {
    const next = new URLSearchParams(sp.toString());
    next.delete('modal');
    next.delete('nft');
    pushParams(router, pathname!, next);
  };

  const open = (name: string, params?: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    next.set('modal', name);
    if (params) Object.entries(params).forEach(([k, v]) => next.set(k, v));
    pushParams(router, pathname!, next);
  };

  return (
    <>
      {/* 市场列表弹窗：内部自行拉接口，不再传 mock items */}
      <MarketModal
        open={modal === 'market'}
        onOpenChange={(o) => (o ? open('market') : close())}
        onSelect={(id) => open('detail', { nft: id })}  // ✅ 点行/BUY 打开详情
      />

      {/* 详情弹窗：用 nftId 作为 opinionId 拉取详情 */}
      <NFTDetailModal
        open={modal === 'detail'}
        onOpenChange={(o) =>
          o
            ? open('detail', nftId ? { nft: nftId } : undefined)
            : close()
        }
        opinionId={nftId}                 // ✅ 关键：传给详情组件
        onBuy={(id) => {
          // TODO: 接后端购买接口 / 合约逻辑
          console.log('buy opinionId:', id);
        }}
        onBack={() => open('market')}
      />

      {/* 发布弹窗保持不变 */}
      <PublishModal
        open={modal === 'publish'}
        onOpenChange={(o) => (o ? open('publish') : close())}
      />
    </>
  );
}