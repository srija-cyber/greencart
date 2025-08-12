import { useState, useEffect } from 'react';
import { startSimulation } from '../services/api';
import { io } from 'socket.io-client';

const Simulation = () => {
  const [simulationName, setSimulationName] = useState('');
  const [duration, setDuration] = useState(1); // in minutes
  const [telemetryData, setTelemetryData] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [runId, setRunId] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(); // Connects to the same host/port as the frontend, proxy handles it
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setSimulationStatus('Connected');
    });

    newSocket.on('telemetry', (data) => {
      setTelemetryData((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 entries
    });

    newSocket.on('simulationEnd', (data) => {
      setSimulationStatus(`Simulation ${data.runId} ended.`);
      setRunId(null);
      newSocket.emit('leaveSimulation', data.runId);
      
      // Show results if available
      if (data.results) {
        alert(`Simulation completed!\n\nResults:\n- Total Profit: $${data.results.totalProfit}\n- Efficiency Score: ${data.results.efficiencyScore}%\n- Deliveries: ${data.results.deliveries.total}\n- On-time Rate: ${data.results.deliveries.onTimePercentage}%`);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setSimulationStatus('Disconnected');
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError('Socket error: ' + err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleStartSimulation = async () => {
    setLoading(true);
    setError('');
    setTelemetryData([]);
    
    try {
      // Get user token to verify authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await startSimulation({
        name: simulationName || `Simulation ${new Date().toLocaleString()}`,
        duration: parseInt(duration),
        driverIds: ['656a1b2c3d4e5f6a7b8c9d0e', '656a1b2c3d4e5f6a7b8c9d0f'], // Mock driver IDs
        orderIds: ['656a1b2c3d4e5f6a7b8c9d10', '656a1b2c3d4e5f6a7b8c9d11'], // Mock order IDs
        params: { 
          speedVariance: 0.1, 
          trafficFactor: 1.2,
          breakdownProbability: 0.05,
          rerouteProbability: 0.1
        }
      });
      
      setRunId(response.data.runId);
      setSimulationStatus(`Simulation ${response.data.runId} started.`);
      
      if (socket) {
        socket.emit('joinSimulation', response.data.runId);
      }
    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message || 'Failed to start simulation';
      setError(errorMessage);
      console.error('Simulation start error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStopSimulation = async () => {
    if (!runId) return;
    
    try {
      // Stop simulation logic would go here
      setSimulationStatus(`Simulation ${runId} stopped.`);
      setRunId(null);
      if (socket) {
        socket.emit('leaveSimulation', runId);
      }
    } catch (e) {
      setError('Failed to stop simulation: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Simulation</h1>
          <p className="text-sm text-gray-600">Run delivery simulations and monitor real-time telemetry</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Controls</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Simulation Name
                </label>
                <input
                  type="text"
                  value={simulationName}
                  onChange={(e) => setSimulationName(e.target.value)}
                  placeholder="Enter simulation name"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleStartSimulation}
                  disabled={loading || runId}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Starting...' : 'Start Simulation'}
                </button>
                
                {runId && (
                  <button
                    onClick={handleStopSimulation}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Stop
                  </button>
                )}
              </div>

              {simulationStatus && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                  Status: {simulationStatus}
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Display */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Telemetry</h2>
            
            {telemetryData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {runId ? 'Waiting for telemetry data...' : 'Start a simulation to see telemetry data'}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {telemetryData.map((data, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Driver:</span> {data.driverId}
                      </div>
                      <div>
                        <span className="font-medium">Speed:</span> {data.speed?.toFixed(1)} km/h
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {data.lat?.toFixed(4)}, {data.lon?.toFixed(4)}
                      </div>
                      <div>
                        <span className="font-medium">Battery:</span> {data.battery_pct}%
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Simulation Info */}
        {runId && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Simulation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">Run ID</div>
                <div className="text-lg font-mono text-blue-900">{runId}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600">Duration</div>
                <div className="text-lg font-semibold text-green-900">{duration} minutes</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600">Telemetry Points</div>
                <div className="text-lg font-semibold text-purple-900">{telemetryData.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulation;
