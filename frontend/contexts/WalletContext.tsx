'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppKit } from '@reown/appkit/react';

import { useWalletInfo } from '@/hooks/useWalletInfo';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType {
  state: WalletState;
  connectWallet: () => Promise<void>;
  connectWithGoogle: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const ERROR_MESSAGES = {
  wallet: '钱包连接失败，请重试',
  google: 'Google登录失败，请重试',
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { open } = useAppKit();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const {
    address,
    isConnected,
    isConnecting,
    formattedBalance,
    connect,
    disconnect: disconnectWallet,
    refetchBalance,
  } = useWalletInfo();

  useEffect(() => {
    if (!isConnected) {
      setError(null);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      refetchBalance().catch(() => null);
    }
  }, [isConnected, refetchBalance]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (isConnected) {
      document.cookie = 'mc_auth=1; Max-Age=31536000; Path=/';

      if (pathname === '/login') {
        router.replace('/');
      }
    } else {
      document.cookie = 'mc_auth=; Max-Age=0; Path=/';

      if (pathname !== '/login') {
        router.replace('/login');
      }
    }
  }, [isConnected, pathname, router]);

  const connectWallet = useCallback(async () => {
    setError(null);
    try {
      await connect();
    } catch (err) {
      console.error('AppKit wallet connect error', err);
      setError(ERROR_MESSAGES.wallet);
    }
  }, [connect]);

  const connectWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await open({ view: 'Connect' });
    } catch (err) {
      console.error('AppKit social connect error', err);
      setError(ERROR_MESSAGES.google);
    }
  }, [open]);

  const disconnect = useCallback(async () => {
    setError(null);
    try {
      await disconnectWallet();
    } catch (err) {
      console.error('AppKit disconnect error', err);
      setError('断开连接失败，请重试');
    }
  }, [disconnectWallet]);

  const state = useMemo<WalletState>(
    () => ({
      isConnected,
      address,
      balance: formattedBalance ? Number(formattedBalance) : 0,
      isConnecting,
      error,
    }),
    [address, error, formattedBalance, isConnected, isConnecting]
  );

  const value = useMemo(
    () => ({ state, connectWallet, connectWithGoogle, disconnect }),
    [state, connectWallet, connectWithGoogle, disconnect]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
