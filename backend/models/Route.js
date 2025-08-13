import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startLocation: {
    address: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  endLocation: {
    address: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  waypoints: [{
    address: String,
    coordinates: [Number],
    order: Number
  }],
  estimatedDistance: {
    type: Number,
    min: 0
  },
  estimatedDuration: {
    type: Number,
    min: 0
  },
  trafficLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  baseTimeMin: {
    type: Number,
    min: 0,
    default: 0
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
routeSchema.index({ startLocation: '2dsphere' });
routeSchema.index({ endLocation: '2dsphere' });

export default mongoose.model('Route', routeSchema);
