import mongoose from 'mongoose';
import config from './config.js';
import SimulationRun from './models/SimulationRun.js';

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample simulation data
const sampleSimulations = [
  {
    runId: 'sim-1703000000000',
    name: 'Morning Peak Delivery Test',
    startTime: new Date('2023-12-20T08:00:00Z'),
    endTime: new Date('2023-12-20T09:00:00Z'),
    duration: 60,
    status: 'completed',
    settings: {
      driverIds: ['656a1b2c3d4e5f6a7b8c9d0e', '656a1b2c3d4e5f6a7b8c9d0f'],
      orderIds: ['656a1b2c3d4e5f6a7b8c9d10', '656a1b2c3d4e5f6a7b8c9d11'],
      params: {
        speedVariance: 0.15,
        trafficFactor: 1.3,
        breakdownProbability: 0.02,
        rerouteProbability: 0.08
      }
    },
    results: {
      totalProfit: 1250.50,
      efficiencyScore: 87,
      deliveries: {
        total: 25,
        onTime: 22,
        late: 3,
        onTimePercentage: 88.0
      },
      fuelCosts: {
        total: 89.75,
        breakdown: {
          diesel: 45.25,
          petrol: 32.50,
          electric: 12.00
        }
      },
      distance: {
        total: 156.8,
        average: 6.27
      },
      time: {
        total: 3600,
        average: 144
      },
      breakdowns: 1,
      reroutes: 3
    },
    telemetryCount: 3600,
    eventsCount: 15
    // createdBy field removed - will use default or be optional
  },
  {
    runId: 'sim-1703004000000',
    name: 'Low Traffic Efficiency Test',
    startTime: new Date('2023-12-20T10:00:00Z'),
    endTime: new Date('2023-12-20T10:30:00Z'),
    duration: 30,
    status: 'completed',
    settings: {
      driverIds: ['656a1b2c3d4e5f6a7b8c9d0e'],
      orderIds: ['656a1b2c3d4e5f6a7b8c9d10'],
      params: {
        speedVariance: 0.08,
        trafficFactor: 0.9,
        breakdownProbability: 0.01,
        rerouteProbability: 0.03
      }
    },
    results: {
      totalProfit: 680.25,
      efficiencyScore: 94,
      deliveries: {
        total: 12,
        onTime: 12,
        late: 0,
        onTimePercentage: 100.0
      },
      fuelCosts: {
        total: 42.30,
        breakdown: {
          diesel: 25.80,
          petrol: 16.50,
          electric: 0.00
        }
      },
      distance: {
        total: 78.4,
        average: 6.53
      },
      time: {
        total: 1800,
        average: 150
      },
      breakdowns: 0,
      reroutes: 1
    },
    telemetryCount: 1800,
    eventsCount: 8
  },
  {
    runId: 'sim-1703007600000',
    name: 'Afternoon Rush Hour',
    startTime: new Date('2023-12-20T14:00:00Z'),
    endTime: new Date('2023-12-20T15:00:00Z'),
    duration: 60,
    status: 'completed',
    settings: {
      driverIds: ['656a1b2c3d4e5f6a7b8c9d0e', '656a1b2c3d4e5f6a7b8c9d0f', '656a1b2c3d4e5f6a7b8c9d12'],
      orderIds: ['656a1b2c3d4e5f6a7b8c9d10', '656a1b2c3d4e5f6a7b8c9d11', '656a1b2c3d4e5f6a7b8c9d13'],
      params: {
        speedVariance: 0.20,
        trafficFactor: 1.5,
        breakdownProbability: 0.05,
        rerouteProbability: 0.12
      }
    },
    results: {
      totalProfit: 1890.75,
      efficiencyScore: 76,
      deliveries: {
        total: 38,
        onTime: 28,
        late: 10,
        onTimePercentage: 73.7
      },
      fuelCosts: {
        total: 134.60,
        breakdown: {
          diesel: 67.80,
          petrol: 48.90,
          electric: 17.90
        }
      },
      distance: {
        total: 234.6,
        average: 6.17
      },
      time: {
        total: 3600,
        average: 94.7
      },
      breakdowns: 3,
      reroutes: 7
    },
    telemetryCount: 3600,
    eventsCount: 22
  }
];

const seedSimulations = async () => {
  try {
    // Clear existing simulations
    await SimulationRun.deleteMany({});
    console.log('Cleared existing simulations');

    // Insert sample simulations
    const result = await SimulationRun.insertMany(sampleSimulations);
    console.log(`Successfully seeded ${result.length} simulation runs`);

    // Display summary
    result.forEach(sim => {
      console.log(`- ${sim.name}: ${sim.status}, Profit: $${sim.results.totalProfit}, Efficiency: ${sim.results.efficiencyScore}%`);
    });

  } catch (error) {
    console.error('Error seeding simulations:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedSimulations();
