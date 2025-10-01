'use client';

import { useCallback } from 'react';
import type { Abi, Address } from 'viem';

import aiTextNftArtifact from '@/lib/abi/AiTextNFT.json';

import { useContract } from './useContract';

const aiTextNftAbi = aiTextNftArtifact as Abi;

export interface UseAiTextNftOptions {
  address: Address;
  chainId?: number;
}

export interface MintArgs {
  content: string;
  value?: bigint;
  account?: Address;
  chainId?: number;
}

export function useAiTextNft({ address, chainId }: UseAiTextNftOptions) {
  const { read, write, simulate, transaction } = useContract({ address, abi: aiTextNftAbi, chainId });

  const fetchMintFee = useCallback(
    async (overrideChainId?: number) => {
      return (await read({ functionName: 'mintFee', chainId: overrideChainId })) as bigint;
    },
    [read]
  );

  const mint = useCallback(
    async ({ content, value, account, chainId: overrideChainId }: MintArgs) => {
      const callValue = value ?? (await fetchMintFee(overrideChainId));
      console.log('callValue', callValue);

      return await write({
        functionName: 'mint',
        args: [content],
        value: callValue,
        account,
        chainId: overrideChainId,
      });
    },
    [fetchMintFee, write]
  );

  const simulateMint = useCallback(
    async ({ content, value, account, chainId: overrideChainId }: MintArgs) => {
      const callValue = value ?? (await fetchMintFee(overrideChainId));

      return await simulate({
        functionName: 'mint',
        args: [content],
        value: callValue,
        account,
        chainId: overrideChainId,
      });
    },
    [fetchMintFee, simulate]
  );

  return {
    mint,
    simulateMint,
    transaction,
  };
}
