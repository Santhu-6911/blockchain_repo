export const BLOCKCHAIN_CONFIG = {
  LOCAL: {
    chainId: '0x539', // 1337 in hex
    chainName: 'Local Ganache',
    rpcUrls: ['http://127.0.0.1:8545'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  
  SEPOLIA: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH', 
      decimals: 18
    }
  }
};

export const CONTRACT_ADDRESSES = {
  USER_REGISTRY: '0x...',
  AUTHENTICATION_SYSTEM: '0x...' 
};

export const IPFS_CONFIG = {
  host: 'localhost',
  port: 5001,
  protocol: 'http'
};