import { useState, useEffect } from 'react';
import { getSimulationHistory, getSimulationDetails } from '../services/api';
import { format } from 'date-fns';

const SimulationHistory = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    limit: 50
  });

  const loadSimulations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getSimulationHistory(filters);
      setSimulations(response.data.simulations || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load simulation history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimulations();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = async (simulation) => {
    try {
      const details = await getSimulationDetails(simulation.runId);
      setSelectedSimulation(details.data);
      setShowDetails(true);
    } catch (e) {
      alert('Failed to load simulation details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Simulation History</h1>
          <p className="text-sm text-gray-600">View and analyze past simulation runs</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="stopped">Stopped</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {simulations.map((sim) => (
                    <tr key={sim.runId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {sim.runId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sim.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(sim.startTime), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(sim.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sim.status)}`}>
                          {sim.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sim.results ? (
                          <div className="space-y-1">
                            <div>Profit: {formatCurrency(sim.results.totalProfit)}</div>
                            <div>Efficiency: {sim.results.efficiencyScore}%</div>
                            <div>Deliveries: {sim.results.deliveries.total}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No results</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(sim)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {simulations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No simulations found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulation Details Modal */}
      {showDetails && selectedSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Simulation Details: {selectedSimulation.name}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Run ID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{selectedSimulation.runId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSimulation.status)}`}>
                          {selectedSimulation.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Start Time</dt>
                      <dd className="text-sm text-gray-900">
                        {format(new Date(selectedSimulation.startTime), 'PPP p')}
                      </dd>
                    </div>
                    {selectedSimulation.endTime && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">End Time</dt>
                        <dd className="text-sm text-gray-900">
                          {format(new Date(selectedSimulation.endTime), 'PPP p')}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Duration</dt>
                      <dd className="text-sm text-gray-900">{formatDuration(selectedSimulation.duration)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Simulation Settings</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Drivers</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSimulation.settings?.driverIds?.length || 0} drivers
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Orders</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSimulation.settings?.orderIds?.length || 0} orders
                      </dd>
                    </div>
                    {selectedSimulation.settings?.params && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Parameters</dt>
                        <dd className="text-sm text-gray-900">
                          <div>Speed Variance: {selectedSimulation.settings.params.speedVariance || 'N/A'}</div>
                          <div>Traffic Factor: {selectedSimulation.settings.params.trafficFactor || 'N/A'}</div>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Results */}
              {selectedSimulation.results && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Simulation Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Financial Results */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Financial</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Profit:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(selectedSimulation.results.totalProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fuel Costs:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(selectedSimulation.results.fuelCosts.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Results */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Efficiency Score:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedSimulation.results.efficiencyScore}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Distance:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedSimulation.results.distance.total.toFixed(2)} km
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Results */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Deliveries</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedSimulation.results.deliveries.total}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">On Time:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedSimulation.results.deliveries.onTimePercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fuel Cost Breakdown */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Fuel Cost Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Diesel:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(selectedSimulation.results.fuelCosts.breakdown.diesel)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Petrol:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(selectedSimulation.results.fuelCosts.breakdown.petrol)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Electric:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(selectedSimulation.results.fuelCosts.breakdown.electric)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Metrics */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Operational Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Breakdowns:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedSimulation.results.breakdowns}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Reroutes:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedSimulation.results.reroutes}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Telemetry Points:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedSimulation.telemetryCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationHistory;
