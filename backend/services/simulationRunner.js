import SimulationRun from '../models/SimulationRun.js';

// In-memory store for active simulations
const activeSimulations = {};

const simulationRunner = {
  startSimulation: async (io, { name, duration, driverIds, orderIds, params, userId }) => {
    const runId = `sim-${Date.now()}`;
    let currentTick = 0;
    const maxTicks = duration * 60; // duration in minutes, tick every second

    console.log(`Starting simulation ${runId} for ${duration} minutes`);

    // Create simulation run record in database
    const simulationRun = new SimulationRun({
      runId,
      name,
      duration,
      settings: {
        driverIds,
        orderIds,
        params: params || {}
      },
      createdBy: userId || 'system'
    });

    await simulationRun.save();

    // Initialize simulation tracking
    const simulationData = {
      telemetryCount: 0,
      eventsCount: 0,
      deliveries: {
        total: 0,
        onTime: 0,
        late: 0
      },
      fuelCosts: {
        total: 0,
        breakdown: { diesel: 0, petrol: 0, electric: 0 }
      },
      distance: { total: 0, count: 0 },
      time: { total: 0, count: 0 },
      breakdowns: 0,
      reroutes: 0
    };

    const interval = setInterval(async () => {
      currentTick++;
      if (currentTick > maxTicks) {
        clearInterval(interval);
        delete activeSimulations[runId];
        
        // Calculate final results
        const finalResults = calculateFinalResults(simulationData, duration);
        
        // Update simulation run with results
        await SimulationRun.findOneAndUpdate(
          { runId },
          { 
            status: 'completed',
            endTime: new Date(),
            results: finalResults,
            telemetryCount: simulationData.telemetryCount,
            eventsCount: simulationData.eventsCount
          }
        );

        io.to(runId).emit('simulationEnd', { 
          runId, 
          message: 'Simulation completed.',
          results: finalResults
        });
        console.log(`Simulation ${runId} completed.`);
        return;
      }

      // Generate mock telemetry for each driver
      driverIds.forEach(driverId => {
        const lat = 40.7128 + (Math.random() - 0.5) * 0.1; // Mock lat
        const lon = -74.0060 + (Math.random() - 0.5) * 0.1; // Mock lon
        const speed = 20 + Math.random() * 30; // Mock speed
        const distance = speed / 60; // km per second

        const telemetry = {
          runId,
          driverId,
          timestamp: new Date(),
          lat,
          lon,
          speed,
          heading: Math.floor(Math.random() * 360),
          battery_pct: Math.floor(Math.random() * 100),
          orderId: orderIds[Math.floor(Math.random() * orderIds.length)] // Assign a random order
        };

        // Update simulation data
        simulationData.telemetryCount++;
        simulationData.distance.total += distance;
        simulationData.distance.count++;
        simulationData.time.total += 1; // 1 second per tick
        simulationData.time.count++;

        // Simulate fuel consumption
        const fuelType = Math.random() > 0.7 ? 'electric' : (Math.random() > 0.5 ? 'petrol' : 'diesel');
        const fuelCost = (speed / 100) * (fuelType === 'electric' ? 0.1 : (fuelType === 'petrol' ? 0.15 : 0.12));
        simulationData.fuelCosts.total += fuelCost;
        simulationData.fuelCosts.breakdown[fuelType] += fuelCost;

        io.to(runId).emit('telemetry', telemetry);
      });

      // Simulate deliveries
      if (Math.random() < 0.05) { // 5% chance per tick
        simulationData.deliveries.total++;
        if (Math.random() > 0.3) { // 70% on-time
          simulationData.deliveries.onTime++;
        } else {
          simulationData.deliveries.late++;
        }
      }

      // Emit a mock event occasionally
      if (Math.random() < 0.01) { // 1% chance per tick
        const eventType = Math.random() > 0.7 ? 'driverBreakdown' : 'reroute';
        if (eventType === 'driverBreakdown') {
          simulationData.breakdowns++;
        } else {
          simulationData.reroutes++;
        }

        const event = {
          runId,
          type: eventType,
          payload: { 
            driverId: driverIds[Math.floor(Math.random() * driverIds.length)], 
            message: eventType === 'driverBreakdown' ? 'Vehicle breakdown' : 'Route changed due to traffic'
          },
          timestamp: new Date()
        };
        
        simulationData.eventsCount++;
        io.to(runId).emit('event', event);
      }

      if (currentTick % 10 === 0) {
        console.log(`Simulation ${runId}: Tick ${currentTick}/${maxTicks}`);
      }
    }, 1000); // Emit every 1 second

    activeSimulations[runId] = {
      name,
      duration,
      driverIds,
      orderIds,
      params,
      interval,
      startTime: new Date(),
      simulationData
    };
    return runId;
  },

  stopSimulation: async (runId) => {
    if (activeSimulations[runId]) {
      clearInterval(activeSimulations[runId].interval);
      const simulationData = activeSimulations[runId].simulationData;
      delete activeSimulations[runId];

      // Calculate results and update database
      const finalResults = calculateFinalResults(simulationData, 0);
      await SimulationRun.findOneAndUpdate(
        { runId },
        { 
          status: 'stopped',
          endTime: new Date(),
          results: finalResults,
          telemetryCount: simulationData.telemetryCount,
          eventsCount: simulationData.eventsCount
        }
      );

      console.log(`Simulation ${runId} manually stopped.`);
      return true;
    }
    return false;
  },

  getSimulationStatus: (runId) => {
    return activeSimulations[runId] ? { status: 'running', ...activeSimulations[runId] } : { status: 'not-found' };
  },

  getAllSimulations: async (filters = {}) => {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.dateFrom || filters.dateTo) {
      query.startTime = {};
      if (filters.dateFrom) {
        query.startTime.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.startTime.$lte = new Date(filters.dateTo);
      }
    }

    if (filters.userId) {
      query.createdBy = filters.userId;
    }

    return await SimulationRun.find(query)
      .sort({ startTime: -1 })
      .populate('createdBy', 'name email')
      .populate('settings.driverIds', 'name vehicle_type')
      .populate('settings.orderIds', 'orderNumber customerName')
      .limit(filters.limit || 100);
  },

  getSimulationById: async (runId) => {
    return await SimulationRun.findOne({ runId })
      .populate('createdBy', 'name email')
      .populate('settings.driverIds', 'name vehicle_type')
      .populate('settings.orderIds', 'orderNumber customerName');
  }
};

// Helper function to calculate final results
const calculateFinalResults = (simulationData, duration) => {
  const totalDeliveries = simulationData.deliveries.total;
  const onTimePercentage = totalDeliveries > 0 ? (simulationData.deliveries.onTime / totalDeliveries) * 100 : 0;
  
  // Calculate efficiency score based on multiple factors
  const deliveryEfficiency = totalDeliveries > 0 ? Math.min(100, (totalDeliveries / Math.max(1, duration / 10)) * 100) : 0;
  const timeEfficiency = simulationData.time.count > 0 ? Math.max(0, 100 - (simulationData.breakdowns / simulationData.time.count) * 1000) : 100;
  const fuelEfficiency = simulationData.distance.total > 0 ? Math.max(0, 100 - (simulationData.fuelCosts.total / simulationData.distance.total) * 100) : 100;
  
  const efficiencyScore = Math.round((deliveryEfficiency + timeEfficiency + fuelEfficiency) / 3);
  
  // Calculate profit (simplified calculation)
  const revenuePerDelivery = 50; // $50 per delivery
  const costPerKm = 0.5; // $0.50 per km
  const totalRevenue = totalDeliveries * revenuePerDelivery;
  const totalCosts = simulationData.distance.total * costPerKm + simulationData.fuelCosts.total;
  const totalProfit = totalRevenue - totalCosts;

  return {
    totalProfit: Math.round(totalProfit * 100) / 100,
    efficiencyScore: Math.min(100, Math.max(0, efficiencyScore)),
    deliveries: {
      total: totalDeliveries,
      onTime: simulationData.deliveries.onTime,
      late: simulationData.deliveries.late,
      onTimePercentage: Math.round(onTimePercentage * 100) / 100
    },
    fuelCosts: {
      total: Math.round(simulationData.fuelCosts.total * 100) / 100,
      breakdown: {
        diesel: Math.round(simulationData.fuelCosts.breakdown.diesel * 100) / 100,
        petrol: Math.round(simulationData.fuelCosts.breakdown.petrol * 100) / 100,
        electric: Math.round(simulationData.fuelCosts.breakdown.electric * 100) / 100
      }
    },
    distance: {
      total: Math.round(simulationData.distance.total * 100) / 100,
      average: simulationData.distance.count > 0 ? Math.round((simulationData.distance.total / simulationData.distance.count) * 100) / 100 : 0
    },
    time: {
      total: simulationData.time.total,
      average: simulationData.time.count > 0 ? Math.round(simulationData.time.total / simulationData.time.count) : 0
    },
    breakdowns: simulationData.breakdowns,
    reroutes: simulationData.reroutes
  };
};

export default simulationRunner;


