'use client';

import { useCallback } from 'react';
import type { Abi, Address } from 'viem';

import aiLaunchpadArtifact from '@/lib/abi/AiLaunchpad.json';

import { useContract } from './useContract';

const aiLaunchpadAbi = aiLaunchpadArtifact as Abi;

type Bigintish = bigint | number | string;

export interface UseAiLaunchpadOptions {
  address: Address;
  chainId?: number;
}

export interface BuyArgs {
  listingId: Bigintish;
  value: Bigintish;
  account?: Address;
  chainId?: number;
}

function toBigint(value: Bigintish): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string' && value.length > 0) {
    return BigInt(value);
  }
  throw new TypeError('Invalid bigint value');
}

export function useAiLaunchpad({ address, chainId }: UseAiLaunchpadOptions) {
  const { write, simulate, transaction } = useContract({ address, abi: aiLaunchpadAbi, chainId });

  const buy = useCallback(
    async ({ listingId, value, account, chainId: overrideChainId }: BuyArgs) => {
      const normalizedId = toBigint(listingId);
      const callValue = toBigint(value);

      return await write({
        functionName: 'buy',
        args: [normalizedId],
        value: callValue,
        account,
        chainId: overrideChainId,
      });
    },
    [write]
  );

  const simulateBuy = useCallback(
    async ({ listingId, value, account, chainId: overrideChainId }: BuyArgs) => {
      const normalizedId = toBigint(listingId);
      const callValue = toBigint(value);

      return await simulate({
        functionName: 'buy',
        args: [normalizedId],
        value: callValue,
        account,
        chainId: overrideChainId,
      });
    },
    [simulate]
  );

  return {
    buy,
    simulateBuy,
    transaction,
  };
}
