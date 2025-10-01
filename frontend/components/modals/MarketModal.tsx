// components/modals/MarketModal.tsx
"use client";

import * as React from "react";
import Dialog from "@/components/ui/Dialog";
import type { NFTBasic } from "./nfts/NFTCard";
import Button from "@/components/ui/Button";
import NFTListRows from "./nfts/NFTListRows";

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
  const [offset, setOffset] = React.useState(0);
  const [hasNext, setHasNext] = React.useState(true);
  const [listLoading, setListLoading] = React.useState(false);
  const handleLoaded = React.useCallback((count: number) => {
    setHasNext(count >= LIMIT);
  }, [LIMIT]);

  // 弹窗每次打开时重置到第一页
  React.useEffect(() => {
    if (open) {
      setOffset(0);
      setHasNext(true);
    }
  }, [open]);

  const handleNext = () => {
    if (!hasNext || listLoading) return;
    setOffset((o) => o + LIMIT); // ✅ 只做分页偏移
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="text-white text-2xl md:text-3xl font-semibold">
          Let’s Meet
        </span>
      }
      size="lg"
      className="w-[min(780px,95vw,90vh)] h-[min(780px,95vw,90vh)] !p-0"
    >
      <div className="h-full grid grid-rows-[1fr_auto]">
        {/* 列表区 */}
        <div className="overflow-y-auto px-6 pt-6 pr-7">
          <NFTListRows
            open={open}
            // 不传 items => 走接口；若要兼容旧数据，传 items={[]} 也可
            sortBy="price"
            limit={LIMIT}
            offset={offset}
            onLoaded={handleLoaded}
            onLoadingChange={setListLoading} // setState 本身引用是稳定的，保持不变即可
            onSelect={onSelect}
            onBuy={(id) => onSelect?.(id)}                     // 只有点行/BUY 才打开详情
          />
        </div>

        {/* 底部操作区 */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex justify-center gap-4">
            <Button
              appearance="glass"
              size="md"
              onClick={handleNext}
              disabled={!hasNext || listLoading}
              className="min-w-[96px]"
            >
              {listLoading ? (
                <span className="inline-flex items-center">
                  <span className="w-4 h-4 mr-2 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                  Loading
                </span>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}