'use client';

import { useCallback, useMemo } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';

interface WalletInfoOptions {
  balanceRefetchInterval?: number;
}

export const DEFAULT_REFETCH_INTERVAL = 30_000;

export function useWalletInfo(options?: WalletInfoOptions) {
  const refetchInterval = options?.balanceRefetchInterval ?? DEFAULT_REFETCH_INTERVAL;

  const { open } = useAppKit();
  const { address, status, isConnected, chain } = useAccount();
  const { disconnectAsync, isPending: isDisconnecting } = useDisconnect();

  const balanceQuery = useBalance({
    address,
    query: {
      enabled: Boolean(address),
      refetchInterval,
    },
  });

  const connect = useCallback(async () => {
    await open({ view: 'Connect' });
  }, [open]);

  const disconnect = useCallback(async () => {
    if (!disconnectAsync) return;
    await disconnectAsync();
  }, [disconnectAsync]);

  const walletInfo = useMemo(
    () => ({
      address: address ?? null,
      chainId: chain?.id ?? null,
      chainName: chain?.name ?? null,
      isConnected,
      isConnecting:
        status === 'connecting' ||
        status === 'reconnecting' ||
        balanceQuery.isFetching ||
        balanceQuery.isLoading ||
        isDisconnecting,
      balance: balanceQuery.data?.value ?? null,
      formattedBalance: balanceQuery.data?.formatted ?? null,
      balanceSymbol: balanceQuery.data?.symbol ?? null,
      balanceDecimals: balanceQuery.data?.decimals ?? null,
    }),
    [
      address,
      balanceQuery.data?.decimals,
      balanceQuery.data?.formatted,
      balanceQuery.data?.symbol,
      balanceQuery.data?.value,
      balanceQuery.isFetching,
      balanceQuery.isLoading,
      chain?.id,
      chain?.name,
      isConnected,
      isDisconnecting,
      status,
    ]
  );

  return {
    ...walletInfo,
    connect,
    disconnect,
    refetchBalance: balanceQuery.refetch,
    balanceStatus: {
      isFetching: balanceQuery.isFetching,
      isLoading: balanceQuery.isLoading,
      error: balanceQuery.error,
    },
    balanceQuery,
  };
}
