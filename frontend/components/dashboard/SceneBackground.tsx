'use client';

import Image from 'next/image';

type Props = {
  src?: string;
  darken?: number; // 0~1
};

export default function SceneBackground({ src = '/img/background/cover.png', darken = 0 }: Props) {
  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt="Scene background"
        fill
        className="object-cover no-drag select-none pointer-events-none"
        priority
      />
      {darken > 0 && (
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${Math.min(Math.max(darken, 0), 1)})` }}
        />
      )}
    </div>
  );
}