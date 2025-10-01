// components/dashboard/SideToolbar.tsx
'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import IconButton from '@/components/ui/IconButton';

type Item = { key: string; icon: React.ReactNode; onClick?: () => void; active?: boolean };

type Props = {
  /** 传入则完全覆盖默认三颗按钮；不传则使用内置（≡ 打开市场、🍸 打开发布、🚗 关闭弹窗） */
  items?: Item[];
};

const MenuIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 2C3.79086 2 2 3.79086 2 6V18C2 20.2091 3.79086 22 6 22H18C20.2091 22 22 20.2091 22 18V6C22 3.79086 20.2091 2 18 2H6ZM8 6.5C7.44772 6.5 7 6.94772 7 7.5C7 8.05228 7.44772 8.5 8 8.5H16C16.5523 8.5 17 8.05228 17 7.5C17 6.94772 16.5523 6.5 16 6.5H8ZM7 11.5C7 10.9477 7.44772 10.5 8 10.5H16C16.5523 10.5 17 10.9477 17 11.5C17 12.0523 16.5523 12.5 16 12.5H8C7.44772 12.5 7 12.0523 7 11.5ZM8 15C7.44772 15 7 15.4477 7 16C7 16.5523 7.44772 17 8 17H12C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15H8Z"
      fill="white"
    />
  </svg>
);

const PublishIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 12V9.5L19.5 2L22 4.5L14.5 12H12Z"
      fill="white"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12H4.5C3.11929 12 2 13.1193 2 14.5C2 15.8807 3.11929 17 4.5 17H19.5C20.8807 17 22 18.1193 22 19.5C22 20.8807 20.8807 22 19.5 22H9"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function SideToolbar({ items }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const modal = sp.get('modal');

  // 更新 URL searchParams 来控制 ModalRoot
  const setModal = (name?: string, params?: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    if (!name) {
      next.delete('modal');
      next.delete('nft');
    } else {
      next.set('modal', name);
      if (params) Object.entries(params).forEach(([k, v]) => next.set(k, v));
    }
    const url = `${pathname}${next.toString() ? `?${next.toString()}` : ''}`;
    router.push(url);
  };

  const list: Item[] =
    items ??
    [
      { key: 'menu', icon: <MenuIcon />, onClick: () => setModal('market'), active: modal === 'market' },
      { key: 'bar', icon: <PublishIcon />, onClick: () => setModal('publish'), active: modal === 'publish' },
      // { key: 'room', icon: '🚗', onClick: () => setModal(undefined), active: !modal },
    ];

    return (
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20">
        {/* 玻璃态纵向容器 */}
        <div
          className="
            flex flex-col items-center gap-[6px]
            p-[6px]
            rounded-[32px]
            bg-white/10 border border-white/20
            backdrop-blur-xl
            shadow-[0_8px_24px_rgba(0,0,0,.28)]
          "
        >
          {list.map((it) => (
            <IconButton
              key={it.key}
              appearance="ghost"                  /* 保持每个按钮是圆形玻璃态 */
              size="md"                           /* 建议 md，更接近参考图 */
              active={!!it.active}
              aria-label={it.key}
              onClick={it.onClick}
              className="!bg-transparent !border-0 !shadow-none hover:!bg-white/10 hover:border hover:border-white/20 hover:backdrop-blur-xl active:!bg-white/15 transition-colors"            >
              <span className="text-white/90">{it.icon}</span>
            </IconButton>
          ))}
        </div>
      </div>
    );
}