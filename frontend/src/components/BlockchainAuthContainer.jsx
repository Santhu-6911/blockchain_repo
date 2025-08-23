import { useState } from "react";
import BlockchainLoginForm from "./BlockchainLoginForm";
import BlockchainRegistrationForm from "./BlockchainRegisterForm";
import BlockchainDashboard from "./BlockChainDashboard";


export default function BlockchainAuthContainer() {
  const [currentView, setCurrentView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('login');
  };

if (isLoggedIn && currentView === 'dashboard') {
  return <BlockchainDashboard onLogout={handleLogout} />;
}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blockchain Authentication</h1>
          <p className="text-gray-600">Decentralized identity using smart contracts</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setCurrentView('login')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentView === 'login'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentView('register')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentView === 'register'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Deploy Identity
            </button>
          </div>
        </div>

        {currentView === 'login' ? (
          <BlockchainLoginForm 
            onSwitchToRegister={() => setCurrentView('register')}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <BlockchainRegistrationForm 
            onSwitchToLogin={() => setCurrentView('login')}
            onRegistrationSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </div>
  );
}