import type { AppKitOptions } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import {
  mainnet,
  sepolia,
  type AppKitNetwork,
} from '@reown/appkit/networks';
import { defineChain } from 'viem';
import type { Config } from 'wagmi';
import { cookieStorage, createStorage } from 'wagmi';

const FALLBACK_APP_METADATA = {
  name: 'Mooncl',
  description:
    'Mooncl is a platform for creating and sharing your own AI agents.',
  url: 'https://mooncl.app',
  icons: ['https://mooncl.app/icon.png'],
};

// Paseo PassetHub (Polkadot EVM testnet); params from chainlist.org / Polkadot docs
export const paseoPassetHub: AppKitNetwork = defineChain({
  id: 420_420_422,
  name: 'Paseo PassetHub',
  nativeCurrency: { name: 'PAS', symbol: 'PAS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet-passet-hub-eth-rpc.polkadot.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout-passet-hub.parity-testnet.parity.io/',
    },
  },
});
export const celoMainnet: AppKitNetwork = defineChain({
  id: 42220,
  name: 'Celo',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: { default: { http: ['https://forno.celo.org'] } },
  blockExplorers: { default: { name: 'Celoscan', url: 'https://celoscan.io' } }
});

// 2) 定义 Celo Sepolia 测试网（取代 Alfajores）
export const celoSepolia: AppKitNetwork = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: { default: { http: ['https://forno.celo-sepolia.celo-testnet.org'] } },
  blockExplorers: { default: { name: 'Blockscout', url: 'https://celo-sepolia.blockscout.com' } }
});

export const appKitProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  celoMainnet,
  celoSepolia,
  paseoPassetHub,
];

const wagmiAdapter = appKitProjectId
  ? new WagmiAdapter({
      projectId: appKitProjectId,
      networks,
      ssr: true,
      storage: createStorage({ storage: cookieStorage }),
    })
  : undefined;

export const wagmiConfig: Config | undefined = wagmiAdapter?.wagmiConfig;

export const appKitOptions: AppKitOptions | null = wagmiAdapter
  ? {
      projectId: appKitProjectId,
      adapters: [wagmiAdapter],
      networks,
      defaultNetwork: networks[0],
      metadata: FALLBACK_APP_METADATA,
    }
  : null;
