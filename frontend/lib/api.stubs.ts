import type { Address } from 'viem';

export const CELO_MAINNET_CHAIN_ID = 42220;
export const CELO_SEPOLIA_CHAIN_ID = 11142220;
export const PASEO_PASSET_HUB_CHAIN_ID = 420_420_422;

export type ContractAddresses = {
  nft: Address;
  launchpad: Address;
};

// ---- Hardcoded defaults (requested) ----
const CELO_MAIN_MARKET_ADDR =  (
  process.env.NEXT_PUBLIC_CELO_MAIN_MARKET_ADDR ?? '0x4a3a600D326cBb5C6BD9571588AACcb960a33E6A') as Address;
const CELO_MAIN_NFT_ADDR = (
  process.env.NEXT_PUBLIC_CELO_MAIN_NFT_ADDR ?? '0xA1FDE445Bc5Ec40aEfF725C9445aF233117aB133') as Address;

const CELO_TEST_MARKET_ADDR = (
  process.env.NEXT_PUBLIC_CELO_MARKET_ADDR ?? '0xc59A9bF5dD006B23D855dbf88A8d63d9f2CAC288'
) as Address;
const CELO_TEST_NFT_ADDR = (
  process.env.NEXT_PUBLIC_CELO_NFT_ADDR ?? '0xb65496c5FB50a9E79F4b8A21766bf7A018bF9f53'
) as Address;

const PASEO_TEST_MARKET_ADDR = "0x998b7071F33d580B9389203277deA2baf68318aa" as Address;
const PASEO_TEST_NFT_ADDR = "0xb8e16E35DD436231CDa8fb357B4b49928E22c84b" as Address;

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  [CELO_MAINNET_CHAIN_ID]: {
    nft: CELO_MAIN_NFT_ADDR,
    launchpad: CELO_MAIN_MARKET_ADDR,
  },
  [CELO_SEPOLIA_CHAIN_ID]: {
    nft: CELO_TEST_NFT_ADDR,
    launchpad: CELO_TEST_MARKET_ADDR,
  },
};

if (PASEO_TEST_MARKET_ADDR && PASEO_TEST_NFT_ADDR) {
  CONTRACT_ADDRESSES[PASEO_PASSET_HUB_CHAIN_ID] = {
    nft: PASEO_TEST_NFT_ADDR,
    launchpad: PASEO_TEST_MARKET_ADDR,
  };
}

export const DEFAULT_CHAIN_ID = CELO_SEPOLIA_CHAIN_ID;

export function getContractAddresses(chainId?: number): ContractAddresses {
  if (typeof chainId !== 'number') {
    return CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID];
  }
  return CONTRACT_ADDRESSES[chainId] ?? CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID];
}

export function isSupportedChain(chainId?: number): chainId is number {
  if (typeof chainId !== 'number') return false;
  return CONTRACT_ADDRESSES[chainId] !== undefined;
}

export function getLaunchpadAddress(chainId?: number): Address {
  return getContractAddresses(chainId).launchpad;
}

export function getNftAddress(chainId?: number): Address {
  return getContractAddresses(chainId).nft;
}
