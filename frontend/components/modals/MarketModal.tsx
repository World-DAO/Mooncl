// components/modals/MarketModal.tsx
"use client";

import * as React from "react";
import Dialog from "@/components/ui/Dialog";
import type { NFTBasic } from "./nfts/NFTCard";
import Button from "@/components/ui/Button";
import NFTListRows from "./nfts/NFTListRows";
import { getOpinionsRanking } from "@/lib/api/opinions";
import { useChainId } from "wagmi";

interface Props {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  items?: NFTBasic[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export default function MarketModal({
  open,
  onOpenChange,
  items = [],
  selectedId,
  onSelect,
}: Props) {
  const LIMIT = 6;
  const chainId = useChainId();
  const [page, setPage] = React.useState(0);
  const [allItems, setAllItems] = React.useState<NFTBasic[] | null>(null);
  const [loadingAll, setLoadingAll] = React.useState(false);

  // 弹窗每次打开：拉取全部数据一次，后续分页在前端进行
  React.useEffect(() => {
    let alive = true;
    if (!open) return;
    setPage(0);
    setLoadingAll(true);
    (async () => {
      try {
        const list = await getOpinionsRanking({ sort_by: 'price', limit: 1000, offset: 0, chainId });
        if (!alive) return;
        const mapped: NFTBasic[] = list.map((it) => ({
          id: String(it.token_id),
          title: it.title,
          price: it.current_price,
          image: '/img/placeholder/card.png',
          currency: '$',
        }));
        setAllItems(mapped);
      } catch (e) {
        console.error('Fetch market failed', e);
        if (!alive) return;
        setAllItems([]);
      } finally {
        if (alive) setLoadingAll(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  const total = allItems?.length ?? 0;
  const hasNext = (page + 1) * LIMIT < total;
  const hasPrev = page > 0;
  const pageItems = React.useMemo(() => {
    if (!allItems) return [] as NFTBasic[];
    const start = page * LIMIT;
    return allItems.slice(start, start + LIMIT);
  }, [allItems, page]);

  const handleNext = () => {
    if (loadingAll || !hasNext) return;
    setPage((p) => p + 1);
  };
  const handlePrev = () => {
    if (loadingAll || !hasPrev) return;
    setPage((p) => Math.max(0, p - 1));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="text-white text-2xl md:text-3xl font-semibold ml-2">
          ✨ Insight Market
        </span>
      }
      size="lg"
      className="w-[min(780px,95vw,90vh)] h-[min(780px,95vw,90vh)] !p-0"
    >
      <div className="h-full grid grid-rows-[1fr_auto]">
        {/* 列表区 */}
        <div className="overflow-y-auto px-6 pt-6 pr-7">
          <NFTListRows
            // 传入 items（即使为空）以禁用内部请求逻辑；首次加载时显示骨架
            items={pageItems}
            open={false}
            sortBy="price"
            onSelect={onSelect}
            onBuy={(id) => onSelect?.(id)}
          />
        </div>

        {/* 底部操作区 */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex justify-center gap-4">
            {hasPrev && (
              <Button
                appearance="glass"
                size="md"
                onClick={handlePrev}
                disabled={loadingAll}
                className="min-w-[96px]"
              >
                Prev
              </Button>
            )}
            {hasNext && (
              <Button
                appearance="glass"
                size="md"
                onClick={handleNext}
                disabled={loadingAll}
                className="min-w-[96px]"
              >
                {loadingAll ? (
                  <span className="inline-flex items-center">
                    <span className="w-4 h-4 mr-2 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                    Loading
                  </span>
                ) : (
                  "Next"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
