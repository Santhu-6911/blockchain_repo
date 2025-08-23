import { useState, useEffect } from 'react';
import MetricsBox from './Metricsbox';

// Traditional Dashboard Component (embedded)
function TraditionalDashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserData, setTempUserData] = useState({});
  const [performanceData, setPerformanceData] = useState({
    loadTime: 0,
    lastApiCall: 0
  });

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

      console.log('Loading user profile from backend...');

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Profile response:', data);

      if (response.ok && data.success) {
        setUser(data.user);
        setTempUserData(data.user);
        
        const loadTime = Date.now() - startTime;
        setPerformanceData(prev => ({
          ...prev,
          loadTime: loadTime
        }));

        console.log('Profile loaded successfully');
      } else {
        if (response.status === 401) {
          setErrors({ auth: 'Session expired. Please login again.' });
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          onLogout();
        } else {
          setErrors({ load: data.message || 'Failed to load user profile' });
        }
      }

    } catch (error) {
      console.error('Profile load error:', error);
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

      console.log('Logging out...');

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

      console.log('Logout successful');
      onLogout();

    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userType');
      onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching user data from database</p>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
            <h1 className="text-3xl font-bold text-gray-900">Traditional Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isLoggingOut
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            {isLoggingOut ? 'Logging Out...' : 'Logout'}
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">User Profile</h2>
                {/* <button
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isUpdating}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button> */}
              </div>

              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">User ID: #{user.id}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Type</label>
                    <p className="text-gray-900">Traditional Database</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Authentication</label>
                    <p className="text-gray-900">JWT Token</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-700 text-sm">Active Session</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Dashboard Load</label>
                    <p className="text-gray-900">{performanceData.loadTime}ms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">System Performance</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{performanceData.loadTime}ms</div>
                  <div className="text-sm text-gray-600">Profile Load Time</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">JWT</div>
                  <div className="text-sm text-gray-600">Token Authentication</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">DB</div>
                  <div className="text-sm text-gray-600">PostgreSQL Storage</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MetricsBox systemType="traditional" />

   

            {/* System Architecture */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">System Stack</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">React.js Frontend</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Express.js Server</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">PostgreSQL Database</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">JWT Sessions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">bcrypt Encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TraditionalDashboard;