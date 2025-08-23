import Web3 from 'web3';
import { BLOCKCHAIN_CONFIG, CONTRACT_ADDRESSES } from '../config/blockchain';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.chainId = null;
  }

  // Initialize Web3 and connect to MetaMask
  async connect() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Initialize Web3
        this.web3 = new Web3(window.ethereum);
        
        // Get account
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        
        // Get chain ID
        this.chainId = await this.web3.eth.getChainId();
        
        console.log('Connected to:', this.account);
        console.log('Chain ID:', this.chainId);
        
        return {
          success: true,
          account: this.account,
          chainId: this.chainId
        };
      } catch (error) {
        console.error('Connection failed:', error);
        return {
          success: false,
          error: error.message
        };
      }
    } else {
      return {
        success: false,
        error: 'MetaMask not found. Please install MetaMask.'
      };
    }
  }

  // Switch to correct network
  async switchNetwork(network = 'LOCAL') {
    const config = BLOCKCHAIN_CONFIG[network];
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainId }],
      });
      return true;
    } catch (error) {
      // Network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [config],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          return false;
        }
      }
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  // Get account balance
  async getBalance() {
    if (!this.web3 || !this.account) return null;
    
    try {
      const balance = await this.web3.eth.getBalance(this.account);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  }

  // Sign message
  async signMessage(message) {
    if (!this.web3 || !this.account) {
      throw new Error('Web3 not connected');
    }

    try {
      const signature = await this.web3.eth.personal.sign(message, this.account);
      return signature;
    } catch (error) {
      console.error('Signing failed:', error);
      throw error;
    }
  }

  // Estimate gas for transaction
  async estimateGas(contractMethod) {
    try {
      const gasEstimate = await contractMethod.estimateGas({ from: this.account });
      const gasPrice = await this.web3.eth.getGasPrice();
      const gasCost = this.web3.utils.fromWei((gasEstimate * gasPrice).toString(), 'ether');
      
      return {
        gasLimit: gasEstimate,
        gasPrice: gasPrice,
        estimatedCost: gasCost
      };
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw error;
    }
  }

  // Check if wallet is connected
  isConnected() {
    return !!(this.web3 && this.account);
  }

  // Get current account
  getCurrentAccount() {
    return this.account;
  }
}

export default new Web3Service();