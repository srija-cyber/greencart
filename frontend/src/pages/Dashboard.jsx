import { useState, useEffect } from 'react';
import { getDrivers, getRoutes, getOrders } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalRoutes: 0,
    totalOrders: 0,
    availableDrivers: 0,
    activeRoutes: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('Loading dashboard data...');
        
        const [driversResponse, routesResponse, ordersResponse] = await Promise.all([
          getDrivers({ limit: 1000 }),
          getRoutes({ limit: 1000 }),
          getOrders({ limit: 1000 })
        ]);

        console.log('Dashboard API responses:', {
          drivers: driversResponse,
          routes: routesResponse,
          orders: ordersResponse
        });

        // Extract data arrays from responses
        let driversArray = [];
        if (driversResponse && driversResponse.data) {
          driversArray = driversResponse.data.drivers || driversResponse.data || [];
        } else if (driversResponse && driversResponse.drivers) {
          driversArray = driversResponse.drivers;
        } else if (Array.isArray(driversResponse)) {
          driversArray = driversResponse;
        }

        let routesArray = [];
        if (routesResponse && routesResponse.data) {
          routesArray = routesResponse.data.routes || routesResponse.data || [];
        } else if (routesResponse && routesResponse.routes) {
          routesArray = routesResponse.routes;
        } else if (Array.isArray(routesResponse)) {
          routesArray = routesResponse;
        }

        let ordersArray = [];
        if (ordersResponse && ordersResponse.data) {
          ordersArray = ordersResponse.data.orders || ordersResponse.data || [];
        } else if (ordersResponse && ordersResponse.orders) {
          ordersArray = ordersResponse.orders;
        } else if (Array.isArray(ordersResponse)) {
          ordersArray = ordersResponse;
        }

        console.log('Processed arrays:', {
          drivers: driversArray.length,
          routes: routesArray.length,
          orders: ordersArray.length
        });

        // Calculate statistics
        const totalDrivers = driversArray.length;
        const totalRoutes = routesArray.length;
        const totalOrders = ordersArray.length;

        const availableDrivers = driversArray.filter(d => d.isAvailable === true).length;
        const activeRoutes = routesArray.filter(r => r.status === 'in-progress').length;
        const pendingOrders = ordersArray.filter(o => o.status === 'pending').length;
        
        // Get all delivered orders (not just today's)
        const deliveredOrders = ordersArray.filter(o => o.status === 'delivered').length;

        console.log('Calculated stats:', {
          totalDrivers,
          totalRoutes,
          totalOrders,
          availableDrivers,
          activeRoutes,
          pendingOrders,
          deliveredOrders
        });

        setStats({
          totalDrivers,
          totalRoutes,
          totalOrders,
          availableDrivers,
          activeRoutes,
          pendingOrders,
          deliveredOrders
        });
      } catch (error) {
        console.error('Dashboard error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculate delivery performance data
  const deliveryData = [
    { 
      name: 'On Time', 
      value: Math.max(0, stats.deliveredOrders - Math.floor(stats.deliveredOrders * 0.15)), 
      fill: '#10B981' 
    },
    { 
      name: 'Late', 
      value: Math.floor(stats.deliveredOrders * 0.15), 
      fill: '#EF4444' 
    }
  ];

  const fuelData = [
    { name: 'Diesel', value: 45, fill: '#1F2937' },
    { name: 'Petrol', value: 30, fill: '#6B7280' },
    { name: 'Electric', value: 25, fill: '#10B981' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your logistics operations</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDrivers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Routes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeRoutes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.deliveredOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* On-time vs Late Deliveries */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">On-time vs Late Deliveries</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fuel Cost Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fuelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fuelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
