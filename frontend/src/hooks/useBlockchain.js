import { useState, useEffect } from 'react';
import web3Service from '../services/web3Service';
import blockchainAuth from '../services/blockchainAuth';

export const useBlockchain = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if wallet is connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (web3Service.isConnected()) {
      setIsConnected(true);
      setAccount(web3Service.getCurrentAccount());
      const balance = await web3Service.getBalance();
      setBalance(balance);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await web3Service.connect();
      
      if (result.success) {
        setIsConnected(true);
        setAccount(result.account);
        
        const balance = await web3Service.getBalance();
        setBalance(balance);
        
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setBalance(null);
  };

  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await blockchainAuth.registerUser(userData);
      return { success: true, data: result };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await blockchainAuth.loginUser();
      return { success: true, data: result };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    isConnected,
    account,
    balance,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    registerUser,
    loginUser
  };
};