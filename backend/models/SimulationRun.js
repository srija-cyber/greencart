import mongoose from 'mongoose';

const simulationRunSchema = new mongoose.Schema({
  runId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'stopped', 'failed'],
    default: 'running'
  },
  settings: {
    driverIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    }],
    orderIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    params: {
      speedVariance: Number,
      trafficFactor: Number,
      breakdownProbability: Number,
      rerouteProbability: Number
    }
  },
  results: {
    totalProfit: {
      type: Number,
      default: 0
    },
    efficiencyScore: {
      type: Number, // percentage
      default: 0
    },
    deliveries: {
      total: {
        type: Number,
        default: 0
      },
      onTime: {
        type: Number,
        default: 0
      },
      late: {
        type: Number,
        default: 0
      },
      onTimePercentage: {
        type: Number,
        default: 0
      }
    },
    fuelCosts: {
      total: {
        type: Number,
        default: 0
      },
      breakdown: {
        diesel: { type: Number, default: 0 },
        petrol: { type: Number, default: 0 },
        electric: { type: Number, default: 0 }
      }
    },
    distance: {
      total: {
        type: Number, // in km
        default: 0
      },
      average: {
        type: Number,
        default: 0
      }
    },
    time: {
      total: {
        type: Number, // in minutes
        default: 0
      },
      average: {
        type: Number,
        default: 0
      }
    },
    breakdowns: {
      type: Number,
      default: 0
    },
    reroutes: {
      type: Number,
      default: 0
    }
  },
  telemetryCount: {
    type: Number,
    default: 0
  },
  eventsCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
simulationRunSchema.index({ startTime: -1 });
simulationRunSchema.index({ status: 1 });
simulationRunSchema.index({ createdBy: 1 });

const SimulationRun = mongoose.model('SimulationRun', simulationRunSchema);

export default SimulationRun;
