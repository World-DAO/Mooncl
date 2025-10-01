'use client';

import * as React from 'react';
import SceneBackground from '@/components/dashboard/SceneBackground';
import Overlay from '@/components/ui/Overlay';
import TextGradient from '@/components/ui/TextGradient';
import Button from '@/components/ui/Button';

type Props = {
  onSignInGoogle?: () => void;
  onSignInWallet?: () => void;
};

export default function LandingHero({ onSignInGoogle, onSignInWallet }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* 背景（你已有的像素/插画场景组件） */}
      <SceneBackground />

      {/* 叠层遮罩（湖蓝基调 + 顶部加深 + 对角紫光 + 右上角氛围） */}
      <Overlay
        tintColor="hsla(215,78%,44%,0.46)"
        withCornerGradient
        cornerPosition="tr"
        topGradient
        topBlur="none"
        topHeight={120}
        topTint="hsla(215,78%,44%,0.68)"
        topFadeStop={0.40}
        diagonalCorners
        diagonalOpacity={0.85}
        diagonalStopPct={42}
        diagonalGradient={`
          linear-gradient(
            to bottom,
            hsla(278,88%,62%,.95) 0%,
            hsla(278,92%,66%,.75) 50%,
            hsla(278,88%,62%,.95) 100%
          )
        `}
      />

      {/* 内容 */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-[18vh] pb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4">
          Welcome to <TextGradient>Mooncl</TextGradient>
        </h1>
        <p className="text-lg md:text-2xl text-white/80">Aptos Board</p>
        <p className="mt-2 text-base md:text-lg text-white/60">
          Connecting Aptos Ecosystem Partners Effortlessly
        </p>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
          <Button appearance="brand" size="lg" onClick={onSignInGoogle}>
            Sign in with Google
          </Button>
          <Button appearance="glass" size="lg" onClick={onSignInWallet}>
            Sign in with Wallet
          </Button>
        </div>
      </div>
    </main>
  );
}