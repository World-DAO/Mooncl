'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { AppKitProvider } from '@reown/appkit/react';

import { appKitOptions, wagmiConfig, appKitProjectId } from '@/lib/appkit';
import { WalletProvider } from '@/contexts/WalletContext';

type Props = {
  children: ReactNode;
};

const queryClient = new QueryClient();

export default function AppProviders({ children }: Props) {
  if (!wagmiConfig || !appKitOptions) {
    const message =
      'AppKit providers are not configured. Define NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.';

    if (process.env.NODE_ENV === 'development' && !appKitProjectId) {
      console.error(message);
    }

    throw new Error(message);
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider {...appKitOptions}>
          <WalletProvider>{children}</WalletProvider>
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
