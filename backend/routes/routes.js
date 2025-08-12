import express from 'express';
import Route from '../models/Route.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all routes
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, priority } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }

    const routes = await Route.find(query)
      .populate('assignedDriver', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Route.countDocuments(query);

    res.json({
      routes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get route by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('assignedDriver', 'name email phone');
      
    if (!route || !route.isActive) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new route
router.post('/', auth, requireRole(['admin', 'manager', 'dispatcher']), async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();
    
    const populatedRoute = await Route.findById(route._id)
      .populate('assignedDriver', 'name email phone');
      
    res.status(201).json(populatedRoute);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update route
router.put('/:id', auth, requireRole(['admin', 'manager', 'dispatcher']), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'name email phone');
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete route (soft delete)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update route status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['planned', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('assignedDriver', 'name email phone');
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign driver to route
router.patch('/:id/assign-driver', auth, requireRole(['admin', 'manager', 'dispatcher']), async (req, res) => {
  try {
    const { driverId } = req.body;
    
    if (!driverId) {
      return res.status(400).json({ message: 'Driver ID is required' });
    }
    
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { assignedDriver: driverId },
      { new: true }
    ).populate('assignedDriver', 'name email phone');
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get routes by driver
router.get('/driver/:driverId', auth, async (req, res) => {
  try {
    const routes = await Route.find({
      assignedDriver: req.params.driverId,
      isActive: true
    }).populate('assignedDriver', 'name email phone');
    
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
