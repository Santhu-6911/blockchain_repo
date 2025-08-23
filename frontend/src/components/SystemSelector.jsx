import { useState } from 'react';
import TraditionalLoginForm from './TraditionalLoginForm';
import BlockchainLoginForm from './BlockchainLoginForm';
import BlockchainRegistrationForm from './BlockchainRegisterForm';
import BlockchainAuthContainer from './BlockchainAuthContainer';

export default function SystemSelector() {
  const [selectedSystem, setSelectedSystem] = useState(null);

  const handleSystemChoice = (systemType) => {
    setSelectedSystem(systemType);
  };

  const resetSelection = () => {
    setSelectedSystem(null);
  };

  if (selectedSystem) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header with back button */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedSystem === 'traditional' ? 'Traditional Authentication System' : 'Blockchain Authentication System'}
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedSystem === 'traditional' 
                  ? 'Using standard database and server authentication'
                  : 'Using blockchain smart contracts and MetaMask wallet'
                }
              </p>
            </div>
            <button
              onClick={resetSelection}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium border border-blue-600 hover:border-blue-700 rounded-md transition-colors"
            >
              ← Switch System
            </button>
          </div>

          <div className="mb-6 p-4 rounded-lg border-l-4 bg-white shadow-sm">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                selectedSystem === 'traditional' ? 'bg-green-500' : 'bg-orange-500'
              }`}></div>
              <span className="font-medium text-gray-800">
                Currently using: {selectedSystem === 'traditional' ? 'Traditional' : 'Blockchain'} System
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {selectedSystem === 'traditional' ? 'Traditional' : 'Blockchain'} Registration Form
            </h3>
            <p className="text-gray-600 mb-4">
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md">
               {selectedSystem === 'traditional' ?  <TraditionalLoginForm/> : <BlockchainAuthContainer/>} 
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Authentication System Comparison
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.31 4 7 4s7-1.79 7-4V7M4 7c0 2.21 3.31 4 7 4s7-1.79 7-4M4 7c0-2.21 3.31-4 7-4s7 1.79 7 4" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                Traditional System
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Standard authentication using username, password, and database storage.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  PostgreSQL Database
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  Express.js Backend
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  JWT Session Management
                </div>
            
              </div>
              
              <button
                onClick={() => handleSystemChoice('traditional')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
               Use Traditional System
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-lg mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.75 9 9.95V14h2v-2h-2V9.5h2v-2h-2V5.5h2v-2h-2zm0 2.5V7h-2V4.5h2zm0 5V10h-2V7.5h2zm0 5V15h-2v-2.5h2z"/>
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                Blockchain System
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Decentralized authentication using smart contracts and MetaMask wallet.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  MetaMask Integration
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  Decentralized Storage
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  Immutable Records
                </div>
              </div>
              
              <button
                onClick={() => handleSystemChoice('blockchain')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Use Blockchain System
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}