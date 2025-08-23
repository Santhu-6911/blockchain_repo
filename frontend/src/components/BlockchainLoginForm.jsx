import { useState } from 'react';
import BlockchainRegistrationForm from './BlockchainRegisterForm';
import metrics from '../services/simpleMetrics';


function BlockchainLoginForm({ onSwitchToRegister, onLoginSuccess }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const connectWallet = async () => {
    setIsConnectingWallet(true);
    setErrors({});

    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      } else {
        setErrors({ wallet: 'MetaMask not found. Please install MetaMask.' });
      }
    } catch (error) {
      if (error.code === 4001) {
        setErrors({ wallet: 'User rejected the connection request.' });
      } else {
        setErrors({ wallet: 'Failed to connect wallet: ' + error.message });
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleLogin = async () => {
    metrics.startTimer('login');
    if (!walletConnected) {
      setErrors({ wallet: 'Please connect your wallet first' });
      return;
    }

    setIsLoggingIn(true);
    setErrors({});
    
    try {
      const timestamp = new Date().toISOString();
      const sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      const message = `Login to blockchain system\nWallet: ${walletAddress}\nSession: ${sessionId}\nTimestamp: ${timestamp}`;
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });
      
      const response = await fetch('http://localhost:3001/api/auth/blockchain/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          signature: signature,
          message: message,
          sessionId: sessionId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userType', 'blockchain');
        localStorage.setItem('userData', JSON.stringify(data.user));
         metrics.stopTimer('login', 'blockchain'); 
        setSuccess(true);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 2000);
      } else {
        setErrors({ 
          submit: data.message || 'Login failed. Please ensure you are registered.' 
        });
        metrics.addError('blockchain', 'login failed');
      }

    } catch (error) {
      if (error.code === 4001) {
        setErrors({ submit: 'Login cancelled by user.' });
      } else {
        setErrors({ submit: 'Blockchain login failed: ' + error.message });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (success) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Login Successful!</h2>
          <p className="text-gray-600 mb-4">Welcome back, {userData.username}!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Blockchain Sign In</h2>
      
      <div className="mb-6 p-4 border-2 border-dashed border-orange-300 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.75 9 9.95V14h2v-2h-2V9.5h2v-2h-2V5.5h2v-2h-2zm0 2.5V7h-2V4.5h2zm0 5V10h-2V7.5h2zm0 5V15h-2v-2.5h2z"/>
            </svg>
          </div>
          
          {!walletConnected ? (
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">Connect Your Wallet</h3>
              <p className="text-xs text-gray-600 mb-3">Sign in with your registered wallet</p>
              <button
                onClick={connectWallet}
                disabled={isConnectingWallet}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  isConnectingWallet
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white`}
              >
                {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-2">Wallet Connected</h3>
              <p className="text-xs font-mono text-gray-600 break-all mb-2">{walletAddress}</p>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-green-600">Ready to sign in</span>
              </div>
            </div>
          )}
        </div>
        
        {errors.wallet && (
          <p className="mt-2 text-sm text-red-600 text-center">{errors.wallet}</p>
        )}
      </div>

      <div className="space-y-4">
        {errors.submit && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoggingIn || !walletConnected}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isLoggingIn || !walletConnected
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700'
          } text-white`}
        >
          {isLoggingIn ? 'Signing In...' : 'Sign In with Wallet'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Need to create a blockchain identity?{' '}
          <button 
            onClick={onSwitchToRegister}
            className="text-orange-600 hover:text-orange-500 font-medium underline"
          >
            Deploy smart contract
          </button>
        </p>
      </div>
    </div>
  );
}

export default BlockchainLoginForm;
