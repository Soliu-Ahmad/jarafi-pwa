import { JsonRpcProvider } from "ethers";
import { arbitrum, base, celo, mainnet, optimism } from "viem/chains";

// ================= CHAIN CONFIGURATIONS =================
export const CELO_CHAIN = {
  ...celo,
  rpcUrls: {
    default: { http: ["https://forno.celo.org"] },
    public: { http: ["https://forno.celo.org"] },
  },
};

export const ETHEREUM_CHAIN = {
  ...mainnet,
  rpcUrls: {
    default: { http: ["https://eth.llamarpc.com"] },
    public: { http: ["https://eth.llamarpc.com"] },
  },
};

export const ARBITRUM_CHAIN = {
  ...arbitrum,
  name: "Arbitrum One",
  network: "arbitrum",
  rpcUrls: {
    default: { http: ["https://arb1.arbitrum.io/rpc"] },
    public: { http: ["https://arb1.arbitrum.io/rpc"] },
  },
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
};

export const OPTIMISM_CHAIN = {
  ...optimism,
  name: "Optimism",
  network: "optimism",
  rpcUrls: {
    default: { http: ["https://mainnet.optimism.io"] },
    public: { http: ["https://mainnet.optimism.io"] },
  },
};

export const BASE_CHAIN = {
  ...base,
  name: "Base",
  network: "base",
  rpcUrls: {
    default: { http: ["https://mainnet.base.org"] },
    public: { http: ["https://mainnet.base.org"] },
  },
};

export const STARKNET_CHAIN = {
  id: 5,
  name: "StarkNet",
  network: "starknet",
  rpcUrls: {
    default: { http: ["https://free-rpc.nethermind.io/mainnet-juno/"] },
    public: { http: ["https://free-rpc.nethermind.io/mainnet-juno/"] },
  },
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
};
// ================= TOKEN CONFIGURATIONS =================
export const cUsd = {
  id: 1,
  name: "cUSD",
  decimals: 18,
  symbol: "cUSD",
  chainId: CELO_CHAIN.id,
  address: "0x765de816845861e75a25fca122bb6898b8b1282a",
  icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/7236.png",
};

export const cEUR = {
  id: 2,
  name: "cEUR",
  decimals: 18,
  symbol: "cEUR",
  chainId: CELO_CHAIN.id,
  address: "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73",
  icon: "https://static.coinpaprika.com/coin/ceur-celo-euro/logo.png",
};

export const celoToken = {
  id: 3,
  name: "CELO",
  decimals: 18,
  symbol: "CELO",
  chainId: CELO_CHAIN.id,
  address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAM1BMVEX8/1L//1VISRgsLA4vMA8AAAC1tzva3UdKSxj//1QnJw15eyhlZiF2eCeKjC1/gSlGRhfsqGQoAAAAbklEQVR4Ac2RtQHAIBAAg0N8/2kT3K3jmpfD2RYFJEQOIhyAIAglIhEokli2IGWMcpnhTFIgfgAtSWoa0u6J5MAVx3mJWFJfCxA6KVnUaMv6siJdFvoD3c8tWleZegRCXvl8kEjZfvjmlzU/e00+eGQEGEMMUVIAAAAASUVORK5CYII=",
};

export const USDC = {
  id: 4,
  name: "USDC",
  decimals: 6,
  symbol: "USDC",
  icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png",
  networks: {
    [ETHEREUM_CHAIN.id]: {
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    [CELO_CHAIN.id]: { address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" },
    // [ARBITRUM_CHAIN.id]: {
    //   address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    // },
  },
};

export const ETH = {
  id: 6,
  name: "Ethereum",
  decimals: 18,
  symbol: "ETH",
  icon: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
  networks: {
    [ETHEREUM_CHAIN.id]: { address: null },
  },
};

export const USDT = {
  id: 7,
  name: "USDT",
  decimals: 6,
  symbol: "USDT",
  icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
  networks: {
    [ETHEREUM_CHAIN.id]: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
    [CELO_CHAIN.id]: { address: "0x617f3112bf5397D0467D315cC709EF968D9ba546" },
    // [ARBITRUM_CHAIN.id]: {
    //   address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    // },
    // [OPTIMISM_CHAIN.id]: {
    //   address: "0x4200000000000000000000000000000000000006",
    // },
    // [BASE_CHAIN.id]: { address: "0x2f5c8d74c1779e2a43d4dbe1d3b9bbcf8b0c05b2" },
  },
};

export const OP_TOKEN = {
  id: 8,
  name: "Optimism Token",
  decimals: 18,
  symbol: "OP",
  icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/11840.png",
  chainId: OPTIMISM_CHAIN.id,
  address: "0x4200000000000000000000000000000000000042",
};

export const BASE_TOKEN = {
  id: 9,
  name: "Base ETH",
  decimals: 18,
  symbol: "ETH",
  icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/27144.png",
  chainId: BASE_CHAIN.id,
  address: "0x4200000000000000000000000000000000000006",
};

export const ARB = {
  id: 10,
  name: "Arbitrum",
  decimals: 18,
  symbol: "ARB",
  icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/11841.png",
  networks: {
    [ETHEREUM_CHAIN.id]: {
      address: "0xb50721bcf8d664c30412cfbc6cf7a15145234ad1",
    },
    // [ARBITRUM_CHAIN.id]: {
    //   address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    // },
  },
};

// ================= EXPORT ALL CONFIGS =================
export const TOKENS = [
  cUsd,
  cEUR,
  celoToken,
  USDC,
  USDT,
  // OP_TOKEN,
  // BASE_TOKEN,
  // ARB,
];

export const RPC_URLS = {
  [CELO_CHAIN.id]: "https://forno.celo.org",
  [ETHEREUM_CHAIN.id]: "https://eth.llamarpc.com",
  [ARBITRUM_CHAIN.id]: "https://arb1.arbitrum.io/rpc",
  [OPTIMISM_CHAIN.id]: "https://mainnet.optimism.io",
  [BASE_CHAIN.id]: "https://mainnet.base.org",
  [STARKNET_CHAIN.id]: "https://free-rpc.nethermind.io/mainnet-juno/",
};

export const DEFAULT_ADDRESS = "0x6f8f27b80E28D7D85C4970f97763A3dda4a1a497";
