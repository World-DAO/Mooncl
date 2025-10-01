import * as React from 'react';
import Dialog from '../ui/Dialog';
import NFTDetail, { NFTDetailData } from '../modals/nfts/NFTDetail';
import Button from '../ui/Button';
import { getOpinionDetail, type OpinionDetail } from '@/lib/api/opinions';
import { useAiLaunchpad } from '@/hooks/useAiLaunchpad';
import { getLaunchpadAddress, isSupportedChain } from '@/lib/api.stubs';
import { useChainId } from 'wagmi';
import { useWallet } from '@/contexts/WalletContext';
import { parseEther } from 'viem';

interface NFTDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** 兼容旧用法：直接传数据渲染 */
  data?: NFTDetailData;

  /** ✅ 新增：如果传入 opinionId，则在打开时从后端获取详情并覆盖展示 */
  opinionId?: string;

  /** ✅ onBuy 需要把要购买的 id 传出去 */
  onBuy: (id: string) => void;

  onBack: () => void;
}

export default function NFTDetailModal({
  open,
  onOpenChange,
  data,
  opinionId,
  onBuy,
  onBack,
}: NFTDetailModalProps) {
  // 远端映射成 NFTDetailData（仅当传入 opinionId 时使用）
  const [remote, setRemote] = React.useState<NFTDetailData | undefined>(undefined);
  const reqIdRef = React.useRef(0);
  const [buyError, setBuyError] = React.useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = React.useState<string | null>(null);
  const [pendingBuyId, setPendingBuyId] = React.useState<string | null>(null);

  const chainId = useChainId();
  const isChainSupported = isSupportedChain(chainId);
  const resolvedChainId = isChainSupported ? chainId : undefined;
  const launchpadAddress = React.useMemo(
    () => getLaunchpadAddress(resolvedChainId),
    [resolvedChainId]
  );
  const { buy, transaction: buyTx } = useAiLaunchpad({ address: launchpadAddress, chainId: resolvedChainId });
  const { state: walletState, connectWallet } = useWallet();
  const isWrongChain = chainId !== undefined && !isChainSupported;

  React.useEffect(() => {
    if (!open || !opinionId) {
      setRemote(undefined);
      setBuyError(null);
      setLastTxHash(null);
      setPendingBuyId(null);
      buyTx.reset?.();
      return;
    }
    const myId = ++reqIdRef.current;
    const ctrl = new AbortController();

    (async () => {
      try {
        const d: OpinionDetail = await getOpinionDetail(opinionId);
        if (ctrl.signal.aborted || myId !== reqIdRef.current) return;

        const mapped: NFTDetailData = {
          id: String(d.token_id),
          title: d.content || `Opinion #${d.token_id}`,
          image: '/img/placeholder/card.png', // 占位图，满足 NFTDetail 的 image 可选
          desc: d.content ?? '',
          price: Number(d.evaluate_price ?? 0),
          currency: '$',
          owner: d.owner_address || 'unknown',
        };
        setRemote(mapped);
      } catch (e) {
        console.error('fetch detail failed', e);
        setRemote(undefined); // 失败则维持 skeleton，由 NFTDetail 自行处理
      }
    })();

    return () => ctrl.abort();
  }, [buyTx, open, opinionId]);

  // 最终展示数据：优先远端，否则回退父层传入
  const displayData = opinionId ? remote : data;

  // 供 Buy 使用的 id：优先 opinionId，其次 displayData?.id
  const buyId = opinionId ?? displayData?.id;

  const isProcessing = buyTx.isWriting || buyTx.isConfirming;

  const handleBuy = React.useCallback(async () => {
    if (!buyId) return;

    if (isWrongChain) {
      setBuyError('当前链未配置合约');
      return;
    }

    if (!walletState.isConnected) {
      setBuyError('请先连接钱包');
      try {
        await connectWallet();
      } catch (err) {
        console.error('wallet connect failed', err);
      }
      return;
    }

    const price = displayData?.price;
    if (price == null) {
      setBuyError('No price available for this token');
      return;
    }

    let listingId: bigint;
    try {
      listingId = BigInt(buyId);
    } catch (err) {
      setBuyError('Invalid token id');
      return;
    }

    let value: bigint;
    try {
      value = parseEther(price.toString());
    } catch (err) {
      console.error('parse price failed', err);
      setBuyError('Invalid price format');
      return;
    }

    setBuyError(null);
    setPendingBuyId(buyId);
    try {
      await buy({ listingId, value });
    } catch (err) {
      console.error('buy failed', err);
      const message = err instanceof Error ? err.message : 'Buy failed';
      setBuyError(message);
      setPendingBuyId(null);
    }
  }, [buy, buyId, connectWallet, displayData?.price, isWrongChain, walletState.isConnected]);

  React.useEffect(() => {
    if (!isWrongChain && buyError === '当前链未配置合约') {
      setBuyError(null);
    }
  }, [buyError, isWrongChain]);

  React.useEffect(() => {
    if (isProcessing) return;

    if (buyTx.isError) {
      const message = buyTx.error?.message ?? 'Buy failed';
      setBuyError(message);
      setPendingBuyId(null);
      buyTx.reset?.();
      return;
    }

    if (buyTx.isSuccess) {
      setLastTxHash(buyTx.hash ?? null);
      setBuyError(null);
      if (pendingBuyId) {
        onBuy(pendingBuyId);
        setPendingBuyId(null);
      }
    }
  }, [buyTx, isProcessing, onBuy, pendingBuyId]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={<span className="sr-only">NFT Detail</span>}
      size="lg"
      // ✅ 保持你现有 UI 的尺寸与无内边距
      className="w-[min(780px,95vw,90vh)] h-[min(640px,80vh)] !p-0"
      // ✅ 保持你现有 UI 的 footer（仅补上把 id 传给 onBuy）
      footer={
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center justify-center gap-6 w-full">
            <Button
              appearance="glass"
              size="lg"
              className="h-14 min-w-[180px] rounded-2xl"
              onClick={onBack}
            >
              Cancel
            </Button>
            <Button
              appearance="brand"
              size="lg"
              className="h-14 min-w-[220px] rounded-2xl"
              onClick={handleBuy}
              disabled={!buyId || displayData?.price == null || isProcessing}
            >
              {isProcessing ? 'Processing…' : 'Buy'}
            </Button>
          </div>
          {isWrongChain && (
            <div className="text-amber-200 text-sm text-center px-4">
              当前连接的网络暂未配置合约，请切换到受支持的链。
            </div>
          )}
          {buyError && (
            <div className="text-red-200 text-sm text-center px-4">
              {buyError}
            </div>
          )}
          {lastTxHash && (
            <div className="text-white/60 text-sm break-all text-center px-4">
              Tx Hash: {lastTxHash}
            </div>
          )}
        </div>
      }
    >
      {/* ✅ 主体内容占满剩余高度，内部滚动 —— 不改 UI */}
      <div className="h-full overflow-y-auto px-8 pt-6">
        <NFTDetail data={displayData} />
      </div>
    </Dialog>
  );
}
