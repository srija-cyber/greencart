import express from 'express';
import Order from '../models/Order.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Test endpoint to get all orders without filters
router.get('/test/all', auth, async (req, res) => {
  try {
    const allOrders = await Order.find({});
    console.log('All orders in database:', allOrders.length);
    console.log('Order details:', allOrders.map(o => ({
      id: o._id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      isActive: o.isActive,
      createdAt: o.createdAt
    })));
    res.json({ count: allOrders.length, orders: allOrders });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

    console.log('Order query:', query);
    const orders = await Order.find(query)
      .populate('assignedDriver', 'name email phone')
      .populate('assignedRoute', 'name description')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    console.log(`Found ${orders.length} orders out of ${total} total`);
    console.log('Orders:', orders.map(o => ({ id: o._id, orderNumber: o.orderNumber, customerName: o.customerName })));

    const response = {
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };

    console.log('Sending orders response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
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
    console.log('Create Order payload:', JSON.stringify(body, null, 2));

    // Basic validation
    if (!body.customerName || !body.customerEmail || !body.customerPhone) {
      return res.status(400).json({ 
        message: 'Missing required fields: customerName, customerEmail, customerPhone' 
      });
    }

    // Create order data with proper structure
    const orderData = {
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.trim().toLowerCase(),
      customerPhone: body.customerPhone.trim(),
      pickupAddress: {
        address: body.pickupAddress?.address || body.pickupAddress || 'Default Pickup Address',
        type: 'Point',
        coordinates: [
          parseFloat(body.pickupAddress?.coordinates?.[0] || body.pickupLng || -74.006),
          parseFloat(body.pickupAddress?.coordinates?.[1] || body.pickupLat || 40.7128)
        ]
      },
      deliveryAddress: {
        address: body.deliveryAddress?.address || body.deliveryAddress || 'Default Delivery Address',
        type: 'Point',
        coordinates: [
          parseFloat(body.deliveryAddress?.coordinates?.[0] || body.deliveryLng || -71.0589),
          parseFloat(body.deliveryAddress?.coordinates?.[1] || body.deliveryLat || 42.3601)
        ]
      },
      totalWeight: parseFloat(body.totalWeight || 0),
      priority: body.priority || 'medium',
      status: body.status || 'pending',
      isActive: true
    };

    console.log('Processed order data:', JSON.stringify(orderData, null, 2));

    const order = new Order(orderData);
    await order.save();
    
    console.log('Order saved successfully:', order.orderNumber);

    const populatedOrder = await Order.findById(order._id)
      .populate('assignedDriver', 'name email phone')
      .populate('assignedRoute', 'name description');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error?.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        details: validationErrors 
      });
    }
    
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }
    
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
router.delete('/:id', auth, requireRole(['admin', 'manager']), async (req, res) => {
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
