import mongoose from 'mongoose';

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
  deliveryAddress: {
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
  items: [{
    name: {
      type: String,
      required: true
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
    min: 0
  },
  totalVolume: {
    type: Number,
    min: 0
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
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `GC${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
