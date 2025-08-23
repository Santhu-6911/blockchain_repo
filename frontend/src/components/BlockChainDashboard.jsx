import { useState, useEffect } from 'react';
import MetricsBox from './Metricsbox';

export default function BlockchainDashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    loadTime: 0,
    lastApiCall: 0
  });

  const [walletInfo, setWalletInfo] = useState({
    connected: true,
    balance: '2.45 ETH',
    network: 'Ethereum Mainnet',
    gasUsed: '0.0023 ETH'
  });

  const [transactions, setTransactions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const API_BASE_URL = 'http://localhost:3001/api/auth';

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const startTime = Date.now();
    setIsLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setErrors({ auth: 'No authentication token found. Please login again.' });
        setIsLoading(false);
        return;
      }

      console.log('Loading blockchain user profile from backend...');

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Blockchain profile response:', data);

      if (response.ok && data.success) {
        setUser(data.user);
        setTempUsername(data.user.username);
        
        const loadTime = Date.now() - startTime;
        setPerformanceData(prev => ({
          ...prev,
          loadTime: loadTime
        }));

        const storedTxHash = localStorage.getItem('transactionHash');
        const initialTransactions = [
          {
            id: 1,
            type: 'Registration',
            hash: storedTxHash || '0xabc123456789012345678901234567890abcdef12',
            timestamp: data.user.createdAt || new Date().toISOString(),
            status: 'Confirmed'
          }
        ];
        setTransactions(initialTransactions);

        console.log('Blockchain profile loaded successfully');
      } else {
        if (response.status === 401) {
          setErrors({ auth: 'Session expired. Please login again.' });
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('userType');
          localStorage.removeItem('walletAddress');
          onLogout();
        } else {
          setErrors({ load: data.message || 'Failed to load user profile' });
        }
      }

    } catch (error) {
      console.error('Blockchain profile load error:', error);
      setErrors({ 
        load: 'Cannot connect to server. Please check your connection.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const token = localStorage.getItem('authToken');

      console.log('Logging out from blockchain...');

      const logoutTx = {
        id: transactions.length + 1,
        type: 'Logout',
        hash: '0x' + Math.random().toString(16).substring(2, 42),
        timestamp: new Date().toLocaleString(),
        status: 'Confirmed'
      };
      
      setTransactions(prev => [logoutTx, ...prev]);

      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userType');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('transactionHash');

      console.log('Blockchain logout successful');
      onLogout();

    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userType');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('transactionHash');
      onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      // Simulate blockchain transaction for profile update
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newTx = {
        id: transactions.length + 1,
        type: 'Profile Update',
        hash: '0x' + Math.random().toString(16).substring(2, 42),
        timestamp: new Date().toLocaleString(),
        status: 'Confirmed'
      };
      
      setTransactions(prev => [newTx, ...prev]);
      setUser(prev => ({ ...prev, username: tempUsername }));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile on blockchain');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(prev => ({ ...prev, connected: false }));
  };

  const connectWallet = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWalletInfo(prev => ({ ...prev, connected: true }));
    } catch (error) {
      console.error('Failed to connect wallet');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blockchain dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching user data from blockchain</p>
        </div>
      </div>
    );
  }

  if (errors.auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-4">{errors.auth}</p>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600">{errors.load}</p>
          <button 
            onClick={loadUserProfile}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blockchain Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isLoggingOut
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            } text-white`}
          >
            {isLoggingOut ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Recording Logout...
              </div>
            ) : (
              'Logout'
            )}
          </button>
        </div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && !errors.auth && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-md">
            {Object.values(errors).map((error, index) => (
              <p key={index} className="text-red-700">{error}</p>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">User Profile</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isUpdatingProfile}
                  className="text-orange-600 hover:text-orange-700 font-medium disabled:text-gray-400"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.75 9 9.95V14h2v-2h-2V9.5h2v-2h-2V5.5h2v-2h-2zm0 2.5V7h-2V4.5h2zm0 5V10h-2V7.5h2zm0 5V15h-2v-2.5h2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                      )}
                    </div>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-xs font-mono text-orange-600 break-all">{user.walletAddress || 'No wallet connected'}</p>
                    <p className="text-sm text-gray-500">User ID: #{user.id}</p>
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdatingProfile}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      isUpdatingProfile
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700'
                    } text-white`}
                  >
                    {isUpdatingProfile ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating on Blockchain...
                      </div>
                    ) : (
                      'Save to Blockchain'
                    )}
                  </button>
                )}

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Type</label>
                    <p className="text-gray-900">Blockchain Identity</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Authentication</label>
                    <p className="text-gray-900">Wallet Signature</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Dashboard Load</label>
                    <p className="text-gray-900">{performanceData.loadTime}ms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Blockchain Transaction History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600">Type</th>
                      <th className="text-left py-2 text-gray-600">Transaction Hash</th>
                      <th className="text-left py-2 text-gray-600">Timestamp</th>
                      <th className="text-left py-2 text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-100">
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.type === 'Registration' ? 'bg-green-100 text-green-800' :
                            tx.type === 'Login' ? 'bg-blue-100 text-blue-800' :
                            tx.type === 'Logout' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-xs text-gray-600">
                          {tx.hash.substring(0, 20)}...
                        </td>
                        <td className="py-3 text-gray-700">{new Date(tx.timestamp).toLocaleString()}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-700">{tx.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Performance Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">System Performance</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{performanceData.loadTime}ms</div>
                  <div className="text-sm text-gray-600">Profile Load Time</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Wallet</div>
                  <div className="text-sm text-gray-600">Signature Auth</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">ETH</div>
                  <div className="text-sm text-gray-600">Blockchain Network</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Information */}
            <MetricsBox systemType="blockchain" />
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Wallet Information</h2>
              
              {walletInfo.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 text-sm flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Connected
                    </span>
                    <button
                      onClick={disconnectWallet}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Disconnect
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600">Address</label>
                    <p className="font-mono text-xs text-gray-800 break-all">{user.walletAddress || 'Not connected'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600">Balance</label>
                    <p className="font-semibold text-gray-900">{walletInfo.balance}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600">Network</label>
                    <p className="text-gray-900">{walletInfo.network}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Wallet not connected</p>
                  <button
                    onClick={connectWallet}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4"> Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-4 py-2 text-left text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">System Stack</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">React.js Frontend</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Ethereum Blockchain</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Node js Backend</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">MetaMask Wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}