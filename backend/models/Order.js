import mongoose from 'mongoose';
import Counter from './Counter.js';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  pickupAddress: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length === 2 && 
                 v.every(coord => typeof coord === 'number' && Number.isFinite(coord));
        },
        message: 'Coordinates must be an array of 2 valid numbers'
      }
    }
  },
  deliveryAddress: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length === 2 && 
                 v.every(coord => typeof coord === 'number' && Number.isFinite(coord));
        },
        message: 'Coordinates must be an array of 2 valid numbers'
      }
    }
  },
  items: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    weight: {
      type: Number,
      min: 0
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  }],
  totalWeight: {
    type: Number,
    min: 0,
    default: 0
  },
  totalVolume: {
    type: Number,
    min: 0,
    default: 0
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  pickupDate: {
    type: Date
  },
  deliveryDate: {
    type: Date
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
orderSchema.index({ pickupAddress: '2dsphere' });
orderSchema.index({ deliveryAddress: '2dsphere' });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'orderNumber',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderNumber = `GC${String(counter.seq).padStart(6, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model('Order', orderSchema);
