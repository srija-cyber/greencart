import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['truck', 'van', 'car'],
    required: true
  },
  vehicleCapacity: {
    type: Number,
    required: true,
    min: 0
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for geospatial queries
driverSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model('Driver', driverSchema);
