'use client';

import * as React from 'react';
import NFTListRow from './NFTListRow';
import type { NFTBasic } from './NFTCard';
import { getOpinionsRanking } from '@/lib/api/opinions';
import { useToast } from '@/components/providers/ToastProvider';

type Props = {
  /** 父层不传或传空数组时，组件内部会自动从接口拉取榜单 */
  items?: NFTBasic[];
  onSelect?: (id: string) => void;
  onBuy?: (id: string) => void;
  sortBy?: 'price' | 'recent';
  /** 只在打开时拉取 */
  open?: boolean;

  /** 分页控制 */
  limit?: number;
  offset?: number;

  /** 把本次返回的条数回传给父层（用于判断 hasNext） */
  onLoaded?: (count: number) => void;

  /** 把加载态回传给父层（用于禁用 Next 按钮） */
  onLoadingChange?: (loading: boolean) => void;
};

export default function NFTListRows({
  items,
  onSelect,
  onBuy,
  sortBy = 'price',
  open = true,
  limit = 6,
  offset = 0,
  onLoaded,
  onLoadingChange,
}: Props) {
  const [data, setData] = React.useState<NFTBasic[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const firstLoadedRef = React.useRef(false);
  const reqIdRef = React.useRef(0); // 请求去重
  const toast = useToast();

  // ✅ 用 ref 保存回调，避免把回调放进依赖数组导致重复请求
  const loadedRef = React.useRef<Props['onLoaded'] | undefined>(undefined);
  const loadingRef = React.useRef<Props['onLoadingChange'] | undefined>(undefined);
  loadedRef.current = onLoaded;
  loadingRef.current = onLoadingChange;

  // 如果父层明确传入 items（包括空数组），则跳过内部请求，完全由父层控制
  const externalControl = items !== undefined;

  React.useEffect(() => {
    if (externalControl) {
      setData(items ?? []);
      firstLoadedRef.current = true;
      loadingRef.current?.(false);
      loadedRef.current?.((items?.length ?? 0));
      return;
    }

    if (!open) return;

    const myId = ++reqIdRef.current;
    const ctrl = new AbortController();

    setLoading(true);
    loadingRef.current?.(true);
    setError(null);

    getOpinionsRanking({ sort_by: sortBy, limit, offset })
      .then((list) => {
        if (ctrl.signal.aborted || myId !== reqIdRef.current) return;

        const mapped: NFTBasic[] = list.map((it) => ({
          id: String(it.token_id),
          title: it.title,
          price: it.current_price,
          owner: it.owner_address,
          image: '/img/placeholder/card.png', // 占位图
        }));

        // 覆盖当前页数据（不追加），防止叠加
        setData(mapped);
        firstLoadedRef.current = true;
        loadedRef.current?.(mapped.length);
      })
      .catch((e) => {
        if (ctrl.signal.aborted || myId !== reqIdRef.current) return;
        const msg = e.message || 'Failed to load';
        setError(msg);
        toast.error(msg, 'Market');
        loadedRef.current?.(0);
      })
      .finally(() => {
        if (ctrl.signal.aborted || myId !== reqIdRef.current) return;
        setLoading(false);
        loadingRef.current?.(false);
      });

    return () => ctrl.abort();
  }, [items, externalControl, sortBy, open, limit, offset]);

  // —— 首次加载：骨架 + 文案 ——
  if (loading && !firstLoadedRef.current) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
        <div className="h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
        <div className="h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
        <div className="flex items-center justify-center py-4 text-white/70">
          <span className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {loading && firstLoadedRef.current && (
        <div className="flex items-center justify-center py-2 text-white/60 text-sm">
          <span className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin mr-2" />
          Refreshing...
        </div>
      )}

      {/* 错误改为 toast，不在此处显示 */}

      {data.map((it) => (
        <NFTListRow
          key={it.id}
          item={it}
          onClick={() => onSelect?.(it.id)}
          onBuy={() => onBuy?.(it.id)}
        />
      ))}

      {!loading && data.length === 0 && !error && (
        <div className="text-white/60 text-sm px-2 py-8 text-center">
          No opinions yet.
        </div>
      )}
    </div>
  );
}
