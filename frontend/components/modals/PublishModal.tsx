"use client";

import * as React from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import PublishForm, {
  PublishDraft,
} from "@/components/modals/nfts/PublishForm";
import PublishResult from "@/components/modals/nfts/PublishResult";
import { useAiTextNft } from "@/hooks/useAiTextNft";
import { getNftAddress, isSupportedChain } from "@/lib/api.stubs";
import { useChainId } from "wagmi";
import { useWallet } from "@/contexts/WalletContext";

type Step = "form" | "loading" | "result";

type Props = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmitDraft?: (draft: PublishDraft) => Promise<void> | void;
  onCloseAll?: () => void;
};

export default function PublishModal({
  open,
  onOpenChange,
  onSubmitDraft,
  onCloseAll,
}: Props) {
  const [step, setStep] = React.useState<Step>("form");
  const [score, setScore] = React.useState<number>(0);
  const [mintError, setMintError] = React.useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = React.useState<PublishDraft | null>(null);
  const [lastTxHash, setLastTxHash] = React.useState<string | null>(null);

  const chainId = useChainId();
  const isChainSupported = isSupportedChain(chainId);
  const resolvedChainId = isChainSupported ? chainId : undefined;
  const nftAddress = React.useMemo(
    () => getNftAddress(resolvedChainId),
    [resolvedChainId]
  );
  const { mint, transaction: mintTx } = useAiTextNft({ address: nftAddress, chainId: resolvedChainId });
  const { state: walletState, connectWallet } = useWallet();
  const isWrongChain = chainId !== undefined && !isChainSupported;

  React.useEffect(() => {
    if (!open) {
      setStep("form");
      setScore(0);
      setMintError(null);
      setPendingDraft(null);
      setLastTxHash(null);
      mintTx.reset?.();
    }
  }, [open, mintTx]);

  const calcScore = React.useCallback((content: string) => {
    const len = Math.max(0, Math.min(500, content.trim().length));
    return 65 + Math.round((len / 500) * 30); // 65~95
  }, []);

  React.useEffect(() => {
    if (!isWrongChain && mintError === "当前链未配置合约") {
      setMintError(null);
    }
  }, [isWrongChain, mintError]);

  const submitDraft = async (draft: PublishDraft) => {
    const content = draft.content.trim();
    if (!content) {
      setMintError("Content is required");
      return;
    }

    if (isWrongChain) {
      setMintError("当前链未配置合约");
      return;
    }

    if (!walletState.isConnected) {
      setMintError("请先连接钱包");
      try {
        await connectWallet();
      } catch (err) {
        console.error("wallet connect failed", err);
      }
      return;
    }

    try {
      await onSubmitDraft?.(draft);
    } catch (err) {
      console.error("onSubmitDraft error", err);
    }

    setMintError(null);
    setPendingDraft(draft);
    setStep("loading");
    try {
      await mint({ content });
    } catch (err) {
      console.error("mint failed", err);
      const message = err instanceof Error ? err.message : "Mint failed";
      setMintError(message);
      setStep("form");
      setPendingDraft(null);
    }
  };

  const closeSelf = () => onOpenChange?.(false);

  React.useEffect(() => {
    if (step !== "loading") return;
    if (mintTx.isError) {
      const message = mintTx.error?.message ?? "Mint failed";
      setMintError(message);
      setStep("form");
      setPendingDraft(null);
      mintTx.reset?.();
      return;
    }

    if (mintTx.isSuccess) {
      const s = calcScore(pendingDraft?.content ?? "");
      setScore(s);
      setLastTxHash(mintTx.hash ?? null);
      setPendingDraft(null);
      setStep("result");
    }
  }, [calcScore, mintTx, pendingDraft, step]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={<span className="sr-only">Publish</span>}
      size="lg"
      className="w-[min(780px,95vw,90vh)] h-[min(620px,90vh)] !p-0"
      /* 不传 border => 默认米白边框；已去掉彩色描边 */
    >
      {/* 统一一个内容高度：min-h-[56vh]，三个步骤都套这个容器 */}
      {step === "form" && (
        <div className="h-full grid grid-rows-[auto_1fr_auto] gap-6">
          {/* 静态标题：与关闭按钮分离，距离顶部 16/24px */}
          <div className="px-8 pt-4 md:pt-6">
            <h2 className="text-white text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-xl bg-white/8 border border-white/20 backdrop-blur-lg">
                <span className="text-xl md:text-2xl">👋</span>
              </span>
              <span>Turn your opinions into assets</span>
            </h2>
          </div>

          {/* 可滚动内容区 */}
          <div className="overflow-y-auto px-8 mt-6 md:mt-10">
            <PublishForm onSubmit={submitDraft} />
            {isWrongChain && (
              <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-amber-100 text-sm">
                当前连接的网络暂未配置合约，请切换到受支持的链。
              </div>
            )}
            {mintError && (
              <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-red-100 text-sm">
                {mintError}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-6 px-8 pb-6 md:pb-8">
            <Button
              appearance="glass"
              size="lg"
              className="h-16 min-w-[280px] rounded-2xl"
              onClick={closeSelf}
            >
              Try later
            </Button>
            <Button
              appearance="brand"
              size="lg"
              className="h-16 min-w-[280px] rounded-2xl"
              onClick={() => {
                const form = document.querySelector("form");
                (form as HTMLFormElement)?.requestSubmit();
              }}
            >
              Mint
            </Button>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div className="h-full flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-white/30 border-t-transparent animate-spin" />
          <div className="text-white/80 text-center space-y-2">
            <div>{mintTx.isConfirming ? "Waiting for confirmation…" : "Submitting mint transaction…"}</div>
            {mintTx.hash && (
              <div className="text-sm text-white/60 break-all">Tx Hash: {mintTx.hash}</div>
            )}
          </div>
        </div>
      )}

      {step === "result" && (
        <div className="h-full flex items-center justify-center">
          <div className="space-y-6 text-center">
            <PublishResult
              score={score}
              onConfirm={() => {
                mintTx.reset?.();
                setLastTxHash(null);
                if (onCloseAll) onCloseAll();
                else closeSelf();
              }}
            />
            {lastTxHash && (
              <div className="text-white/60 text-sm break-all">
                Tx Hash: {lastTxHash}
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
