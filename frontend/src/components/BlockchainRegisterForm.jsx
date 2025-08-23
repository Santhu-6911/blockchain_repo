import { useState } from 'react';
import metrics from '../services/simpleMetrics';

export default function BlockchainRegistrationForm({ onSwitchToLogin, onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const connectWallet = async () => {
    setIsConnectingWallet(true);
    setErrors(prev => ({ ...prev, wallet: '' }));
metrics.startTimer('walletConnection');
    try {
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask detected, requesting account access...');
        setCurrentStep(2);
        
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
         metrics.stopTimer('walletConnection', 'blockchain');
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          setWalletConnected(true);
          setCurrentStep(3);
          
          // Estimate gas costs for smart contract deployment
          const estimatedGas = Math.random() * 0.01 + 0.005; // 0.005-0.015 ETH
          const ethPrice = 2000; // Assume $2000 per ETH
          setGasEstimate({
            eth: estimatedGas.toFixed(6),
            usd: (estimatedGas * ethPrice).toFixed(2)
          });
          
          console.log('Wallet connected:', address);
          console.log('Gas estimate:', estimatedGas, 'ETH');
          
        } else {
          setErrors(prev => ({ 
            ...prev, 
            wallet: 'No accounts found. Please unlock MetaMask.' 
          }));
          setCurrentStep(1);
        }
      } else {
        setErrors(prev => ({ 
          ...prev, 
          wallet: 'MetaMask not found. Please install MetaMask browser extension.' 
        }));
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setCurrentStep(1);
       metrics.addError('blockchain', 'wallet connection failed');
      if (error.code === 4001) {
        setErrors(prev => ({ 
          ...prev, 
          wallet: 'User rejected the connection request.' 
        }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          wallet: 'Failed to connect wallet: ' + error.message 
        }));
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!walletConnected) {
      newErrors.wallet = 'Please connect your MetaMask wallet first';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required for smart contract';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required for recovery';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    return newErrors;
  };

  const deploySmartContract = async () => {
    setCurrentStep(4);
    
    // Simulate smart contract deployment with realistic delays
    console.log('Step 1: Preparing smart contract deployment...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentStep(5);
    console.log('Step 2: Requesting transaction signature...');
    
    // Simulate MetaMask transaction approval
    const message = `Deploy user registry contract for ${formData.username}`;
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress],
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCurrentStep(6);
    
    console.log('Step 3: Broadcasting to blockchain network...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCurrentStep(7);
    console.log('Step 4: Waiting for block confirmation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate realistic transaction hash
    const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    setTransactionHash(txHash);
    
    return { signature, txHash, message };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    metrics.startTimer('registration');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {


      // Deploy smart contract (simulated with real delays)
      const { signature, txHash } = await deploySmartContract();
      
      // Store in decentralized storage simulation
      setCurrentStep(8);
      console.log('Step 5: Storing data on IPFS...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Sending data:', {
  username: formData.username,
  email: formData.email,
  walletAddress: walletAddress,
  signature: signature,
  transactionHash: txHash,
  gasUsed: gasEstimate.eth
});
      // Backend only stores wallet address and minimal data
      const response = await fetch('http://localhost:3001/api/auth/blockchain/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          walletAddress: walletAddress,
          signature: signature,
          transactionHash: txHash,
          gasUsed: gasEstimate.eth
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store blockchain authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userType', 'blockchain');
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('walletAddress', walletAddress);
        localStorage.setItem('transactionHash', txHash);
        
        console.log('Blockchain registration successful');
        setSuccess(true);
       metrics.stopTimer('registration', 'blockchain');
      metrics.markCompleted('blockchain');
        setTimeout(() => {
          setSuccess(false);
          if (onRegistrationSuccess) {
            onRegistrationSuccess();
          }
        }, 3000);
        
      } else {
        setErrors({ 
          submit: data.message || 'Smart contract deployment failed.' 
        });
      }

    } catch (error) {
      console.error('Blockchain registration error:', error);
         metrics.addError('blockchain', 'registration failed');
      if (error.message.includes('sign')) {
        setErrors({ 
          submit: 'Transaction rejected by user.' 
        });
      } else {
        setErrors({ 
          submit: 'Blockchain transaction failed: ' + error.message 
        });
      }
    } finally {
      setIsSubmitting(false);
      setCurrentStep(3);
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Smart Contract Deployed!</h2>
          <p className="text-gray-600 mb-4">Welcome {userData.username}! Your identity is now on the blockchain.</p>
          
          <div className="bg-orange-50 p-4 rounded-md mb-4 text-left">
            <div className="text-sm text-orange-800 space-y-2">
              <div className="flex justify-between">
                <span>⛽ Gas Used:</span>
                <span>{gasEstimate?.eth} ETH (${gasEstimate?.usd})</span>
              </div>
              <div className="break-all">
                <span>🔗 Transaction:</span>
                <div className="font-mono text-xs mt-1">{transactionHash}</div>
              </div>
              <div>✅ Immutable record created</div>
              <div>🔐 No central authority required</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Redirecting to blockchain dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Blockchain Identity Registration</h2>
      
      {/* Process Steps */}
      <div className="mb-6 p-3 bg-orange-50 rounded-md">
        <div className="text-xs font-medium text-orange-800 mb-2">Registration Process:</div>
        <div className="space-y-1 text-xs">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${currentStep >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            Connect MetaMask wallet
          </div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${currentStep >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            Prepare user data
          </div>
          <div className={`flex items-center ${currentStep >= 4 ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${currentStep >= 4 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            Deploy smart contract
          </div>
          <div className={`flex items-center ${currentStep >= 7 ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${currentStep >= 7 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            Wait for blockchain confirmation
          </div>
        </div>
      </div>

      {/* MetaMask Wallet Connection */}
      <div className="mb-6 p-4 border-2 border-dashed border-orange-300 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.75 9 9.95V14h2v-2h-2V9.5h2v-2h-2V5.5h2v-2h-2zm0 2.5V7h-2V4.5h2zm0 5V10h-2V7.5h2zm0 5V15h-2v-2.5h2z"/>
            </svg>
          </div>
          
          {!walletConnected ? (
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">Connect Ethereum Wallet</h3>
              <p className="text-xs text-gray-600 mb-3">Your wallet IS your identity on blockchain</p>
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
                <span className="text-xs text-green-600">Ready for smart contract deployment</span>
              </div>
            </div>
          )}
        </div>
        
        {errors.wallet && (
          <p className="mt-2 text-sm text-red-600 text-center">{errors.wallet}</p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-orange-600">(stored on blockchain)</span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your username"
            disabled={isSubmitting || !walletConnected}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Recovery Email <span className="text-orange-600">(for account recovery only)</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter recovery email"
            disabled={isSubmitting || !walletConnected}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">No Password Required</div>
            <div className="text-xs">Your private key IS your password. Authentication happens through wallet signatures.</div>
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        {isSubmitting && (
          <div className="p-3 bg-orange-100 border border-orange-400 text-orange-700 rounded-md">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              {currentStep === 4 && "Preparing smart contract..."}
              {currentStep === 5 && "Requesting MetaMask signature..."}
              {currentStep === 6 && "Broadcasting to blockchain..."}
              {currentStep === 7 && "Waiting for confirmation..."}
              {currentStep === 8 && "Storing on IPFS..."}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !walletConnected}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isSubmitting || !walletConnected
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
          } text-white`}
        >
          {isSubmitting ? (
            'Deploying Smart Contract...'
          ) : (
            `Deploy Identity Contract${gasEstimate ? ` (${gasEstimate.eth} ETH)` : ''}`
          )}
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already deployed your identity?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-orange-600 hover:text-orange-500 font-medium underline"
              disabled={isSubmitting}
            >
              Sign in with wallet
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}