// app/page.tsx
'use client';

import SceneBackground from '@/components/dashboard/SceneBackground';
import SideToolbar from '@/components/dashboard/SideToolbar';
import HudUserInfo from '@/components/dashboard/HudUserInfo';
import ModalRoot from '@/components/layout/ModalRoot';
import { Suspense } from 'react';

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <SceneBackground />

      <div className="relative z-10">
        {/* 🔑 任何用到 useSearchParams 的 Client 组件，都要放进 Suspense */}
        <Suspense fallback={null}>
          <SideToolbar />
        </Suspense>

        <HudUserInfo />
      </div>

      <Suspense fallback={null}>
        <ModalRoot />
      </Suspense>
    </main>
  );
}
