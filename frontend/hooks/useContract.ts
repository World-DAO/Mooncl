'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useConfig, useWaitForTransactionReceipt } from 'wagmi';
import { readContract, simulateContract, writeContract } from 'wagmi/actions';
import type {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
  Hex,
} from 'viem';

export interface UseContractOptions<TAbi extends Abi = Abi> {
  address: Address;
  abi: TAbi;
  chainId?: number;
}

export interface ContractReadConfig<
  TAbi extends Abi = Abi,
  TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'> = ContractFunctionName<
    TAbi,
    'pure' | 'view'
  >,
  TArgs extends
    | ContractFunctionArgs<TAbi, 'pure' | 'view', TFunctionName>
    | undefined = ContractFunctionArgs<TAbi, 'pure' | 'view', TFunctionName> | undefined,
> {
  functionName: TFunctionName;
  args?: TArgs;
  chainId?: number;
}

export interface ContractWriteConfig<
  TAbi extends Abi = Abi,
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'> = ContractFunctionName<
    TAbi,
    'nonpayable' | 'payable'
  >,
  TArgs extends
    | ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>
    | undefined =
    | ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>
    | undefined,
> {
  functionName: TFunctionName;
  args?: TArgs;
  value?: bigint;
  account?: Address;
  chainId?: number;
}

export function useContract<TAbi extends Abi>({ address, abi, chainId }: UseContractOptions<TAbi>) {
  const config = useConfig();
  const { address: connectedAccount } = useAccount();
  const connectedChainId = useChainId();
  const resolvedChainId = chainId ?? connectedChainId ?? undefined;

  const [pendingHash, setPendingHash] = useState<Hex | null>(null);
  const [pendingChainId, setPendingChainId] = useState<number | undefined>(resolvedChainId);
  const [writeError, setWriteError] = useState<Error | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    if (!pendingHash) {
      setPendingChainId(resolvedChainId);
    }
  }, [pendingHash, resolvedChainId]);

  const receiptQuery = useWaitForTransactionReceipt({
    hash: pendingHash ?? undefined,
    chainId: pendingChainId ?? resolvedChainId,
    query: {
      enabled: Boolean(pendingHash),
    },
  });

  const read = useCallback(
    async <TResult = unknown>({
      functionName,
      args,
      chainId: overrideChainId,
    }: ContractReadConfig<TAbi>) => {
      return (await readContract(config, {
        address,
        abi,
        functionName: functionName as ContractFunctionName<TAbi, 'pure' | 'view'>,
        args: args as ContractFunctionArgs<
          TAbi,
          'pure' | 'view',
          ContractFunctionName<TAbi, 'pure' | 'view'>
        >,
        chainId: overrideChainId ?? resolvedChainId,
      })) as TResult;
    },
    [abi, address, config, resolvedChainId]
  );

  const simulate = useCallback(
    async ({
      functionName,
      args,
      value,
      account,
      chainId: overrideChainId,
    }: ContractWriteConfig<TAbi>) => {
      return await simulateContract(
        config,
        {
          address,
          abi,
          functionName: functionName as ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
          args: args as ContractFunctionArgs<
            TAbi,
            'nonpayable' | 'payable',
            ContractFunctionName<TAbi, 'nonpayable' | 'payable'>
          >,
          value,
          account: account ?? connectedAccount,
          chainId: overrideChainId ?? resolvedChainId,
        } as any
      );
    },
    [abi, address, config, connectedAccount, resolvedChainId]
  );

  const write = useCallback(
    async ({
      functionName,
      args,
      value,
      account,
      chainId: overrideChainId,
    }: ContractWriteConfig<TAbi>) => {
      setIsWriting(true);
      setWriteError(null);

      try {
        const callChainId = overrideChainId ?? resolvedChainId;

        const hash = await writeContract(
          config,
          {
            address,
            abi,
            functionName: functionName as ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
            args: args as ContractFunctionArgs<
              TAbi,
              'nonpayable' | 'payable',
              ContractFunctionName<TAbi, 'nonpayable' | 'payable'>
            >,
            value,
            account: account ?? connectedAccount,
            chainId: callChainId,
          } as any
        );

        setPendingHash(hash);
        setPendingChainId(callChainId);
        return hash;
      } catch (error) {
        setWriteError(error as Error);
        throw error;
      } finally {
        setIsWriting(false);
      }
    },
    [abi, address, config, connectedAccount, resolvedChainId]
  );

  const reset = useCallback(() => {
    setPendingHash(null);
    setWriteError(null);
    setPendingChainId(resolvedChainId);
  }, [resolvedChainId]);

  const transaction = useMemo(
    () => ({
      hash: pendingHash,
      chainId: pendingChainId ?? resolvedChainId ?? null,
      isWriting,
      isConfirming: receiptQuery.isLoading,
      isSuccess: receiptQuery.isSuccess,
      isError: Boolean(writeError) || receiptQuery.isError,
      error: writeError ?? receiptQuery.error ?? null,
      receipt: receiptQuery.data ?? null,
      reset,
      refetchReceipt: receiptQuery.refetch,
    }),
    [
      resolvedChainId,
      pendingChainId,
      pendingHash,
      receiptQuery.data,
      receiptQuery.error,
      receiptQuery.isError,
      receiptQuery.isLoading,
      receiptQuery.isSuccess,
      receiptQuery.refetch,
      isWriting,
      reset,
      writeError,
    ]
  );

  return {
    read,
    write,
    simulate,
    transaction,
  };
}
