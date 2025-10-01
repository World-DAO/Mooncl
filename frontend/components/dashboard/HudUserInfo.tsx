// components/dashboard/HudUserInfo.tsx
'use client';

import * as React from 'react';
import { AppKitAccountButton, AppKitNetworkButton } from '@reown/appkit/react';
import { useAccount, useBalance, useChainId, useWatchBlocks } from 'wagmi';

import { isSupportedChain } from '@/lib/api.stubs';

type Props = {
  address?: string;   // 可选：父层传入则优先生效
  balance?: string;   // 可选：父层传入则优先生效（例如 "0.000 CELO"）
  points?: string | number;
};

function shortAddr(addr?: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : 'Connect';
}

export default function HudUserInfo(props: Props) {
  // 1) 从 wagmi 读取当前连接账户
  const { address: wagmiAddress, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { data: bal, refetch } = useBalance({
    address: wagmiAddress,
    chainId,
    query: { enabled: !!wagmiAddress, refetchOnWindowFocus: false }
  });

  useWatchBlocks({
    enabled: !!wagmiAddress,
    onBlock: () => { refetch(); }
  });


  // 2) 计算显示用的地址/余额（props 优先，缺省才回落到 wagmi）
  const addr = props.address ?? (isConnected ? wagmiAddress : undefined);
  const balText =
    props.balance ??
    (bal ? `${Number(bal.formatted).toFixed(3)} ${bal.symbol}` : undefined);

  const supported = chainId ? isSupportedChain(chainId) : false;
  const networkName = chain?.name ?? (chainId ? `Chain ${chainId}` : 'Select Network');
  const networkLabel =
    chainId == null
      ? 'Select Network'
      : supported
      ? networkName
      : `${networkName} (unsupported)`;
  const badgeLetter = (
    chain?.nativeCurrency?.symbol ?? networkName
  )
    .trim()
    .slice(0, 1)
    .toUpperCase() || 'N';
  const badgeTone =
    chainId == null
      ? 'bg-white/25 text-white'
      : supported
      ? 'bg-yellow-300 text-black'
      : 'bg-red-500 text-white';

  return (
    <div className="fixed right-6 top-6 z-20">
      {/* 外层：同款圆角玻璃胶囊 + 收紧间距 */}
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10/50 px-2 py-1 backdrop-blur-xl">
        {/* ========== 网络：视觉层（默认透明，hover 显示） + 透明原生按钮覆盖 ========== */}
        <div className="relative group">
          <div
            className={[
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5',
              'bg-transparent border border-transparent pointer-events-none',
              'transition-all duration-150',
              'group-hover:bg-white/12 group-hover:border-white/20'
            ].join(' ')}
          >
            {/* 链图标：缩小避免裁切 */}
            <span
              className={`inline-grid place-items-center w-5 h-5 rounded-full text-[12px] font-bold ${badgeTone}`}
            >
              {badgeLetter}
            </span>
            <span className="text-white/90 font-medium">{networkLabel}</span>
          </div>

          {/* 真正可点的 AppKit 按钮（透明覆盖，保留原交互） */}
          <AppKitNetworkButton
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          />
        </div>

        {/* ========== 账户：视觉层（默认透明；hover 显示） + 透明原生按钮覆盖 ========== */}
        <div className="relative group">
          <div
            className={[
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5',
              'bg-transparent border border-transparent pointer-events-none',
              'transition-all duration-150',
              'group-hover:bg-white/12 group-hover:border-white/20'
            ].join(' ')}
          >
            {/* 在线指示小圆点 */}
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white/20" />
            {/* 地址 */}
            <span className="text-white/85 font-medium">{shortAddr(addr)}</span>
            {/* 余额（可选） */}
            {balText ? (
              <span className="text-white/70 text-sm ml-1">{balText}</span>
            ) : null}
          </div>

          <AppKitAccountButton
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          />
        </div>
      </div>
    </div>
  );
}
