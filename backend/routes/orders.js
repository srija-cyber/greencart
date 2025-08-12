import express from 'express';
import Order from '../models/Order.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, priority } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }

    const orders = await Order.find(query)
      .populate('assignedDriver', 'name email phone')
      .populate('assignedRoute', 'name description')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('assignedDriver', 'name email phone')
      .populate('assignedRoute', 'name description');
      
    if (!order || !order.isActive) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new order
router.post('/', auth, requireRole(['admin', 'manager', 'dispatcher']), async (req, res) => {
  try {
    const body = req.body || {};

    // Basic debug log to help diagnose payload issues
    try { console.log('Create Order payload:', JSON.stringify(body)); } catch {}

    const isValidPoint = (p) => p && Array.isArray(p.coordinates) && p.coordinates.length === 2 &&
      p.coordinates.every((n) => typeof n === 'number' && Number.isFinite(n));

    if (!body.pickupAddress || !isValidPoint(body.pickupAddress)) {
      return res.status(400).json({ message: 'Invalid pickupAddress coordinates' });
    }
    if (!body.deliveryAddress || !isValidPoint(body.deliveryAddress)) {
      return res.status(400).json({ message: 'Invalid deliveryAddress coordinates' });
    }

    const order = new Order(body);
    // Fallback: ensure orderNumber exists even if pre-save hook fails
    if (!order.orderNumber) {
      const count = await Order.countDocuments();
      order.orderNumber = `GC${String(count + 1).padStart(6, '0')}`;
    }
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('assignedDriver', 'name email phone')
      .populate('assignedRoute', 'name description');

    res.status(201).json(populatedOrder);
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order
router.put('/:id', auth, requireRole(['admin', 'manager', 'dispatcher']), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'name email phone')
     .populate('assignedRoute', 'name description');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete order (soft delete)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updateData = { status };
    
    // Update delivery time when status changes to delivered
    if (status === 'delivered') {
      updateData.actualDeliveryTime = new Date();
    }
    
    // Update pickup time when status changes to picked-up
    if (status === 'picked-up') {
      updateData.pickupDate = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignedDriver', 'name email phone')
     .populate('assignedRoute', 'name description');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign driver to order
router.patch('/:id/assign-driver', auth, requireRole(['admin', 'manager', 'dispatcher']), async (req, res) => {
  try {
    const { driverId } = req.body;
    
    if (!driverId) {
      return res.status(400).json({ message: 'Driver ID is required' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedDriver: driverId },
      { new: true }
    ).populate('assignedDriver', 'name email phone')
     .populate('assignedRoute', 'name description');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign route to order
router.patch('/:id/assign-route', auth, requireRole(['admin', 'manager', 'dispatcher']), async (req, res) => {
  try {
    const { routeId } = req.body;
    
    if (!routeId) {
      return res.status(400).json({ message: 'Route ID is required' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedRoute: routeId },
      { new: true }
    ).populate('assignedDriver', 'name email phone')
     .populate('assignedRoute', 'name description');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get orders by driver
router.get('/driver/:driverId', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      assignedDriver: req.params.driverId,
      isActive: true
    }).populate('assignedDriver', 'name email phone')
     .populate('assignedRoute', 'name description');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get orders by route
router.get('/route/:routeId', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      assignedRoute: req.params.routeId,
      isActive: true
    }).populate('assignedDriver', 'name email phone')
     .populate('assignedRoute', 'name description');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
