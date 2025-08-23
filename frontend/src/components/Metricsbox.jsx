import { useState, useEffect } from 'react';

// Simple Metrics Box - Just add this to your existing dashboards
function MetricsBox({ systemType }) {
  const [metricsData, setMetricsData] = useState(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = () => {
    try {
      const saved = localStorage.getItem('researchMetrics');
      if (saved) {
        const data = JSON.parse(saved);
        setMetricsData(data[systemType] || {});
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const formatTime = (ms) => {
    if (!ms || ms === 0) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (!metricsData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Research Metrics</h3>
        <p className="text-xs text-gray-500">No data collected yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Research Metrics</h3>
        <div className={`w-2 h-2 rounded-full ${metricsData.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Registration:</span>
          <span className="font-mono text-gray-800">{formatTime(metricsData.registrationTime)}</span>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Login:</span>
          <span className="font-mono text-gray-800">{formatTime(metricsData.loginTime)}</span>
        </div>

        {systemType === 'blockchain' && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Wallet:</span>
            <span className="font-mono text-gray-800">{formatTime(metricsData.walletConnectionTime)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Errors:</span>
          <span className={`font-mono ${metricsData.totalErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {metricsData.totalErrors || 0}
          </span>
        </div>

        <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${metricsData.completed ? 'text-green-600' : 'text-yellow-600'}`}>
            {metricsData.completed ? 'Complete' : 'In Progress'}
          </span>
        </div>
      </div>

    </div>
  );
}

export default MetricsBox;