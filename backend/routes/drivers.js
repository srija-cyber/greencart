import express from 'express';
import Driver from '../models/Driver.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Test endpoint to get all drivers without filters
router.get('/test/all', auth, async (req, res) => {
  try {
    const allDrivers = await Driver.find({});
    console.log('All drivers in database:', allDrivers.length);
    console.log('Driver details:', allDrivers.map(d => ({
      id: d._id,
      name: d.name,
      email: d.email,
      isActive: d.isActive,
      createdAt: d.createdAt
    })));
    res.json({ count: allDrivers.length, drivers: allDrivers });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all drivers
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let query = {}; // Temporarily remove isActive filter to see all drivers
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.isAvailable = status === 'available';
    }

    console.log('Driver query:', query);
    const drivers = await Driver.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Driver.countDocuments(query);

    console.log(`Found ${drivers.length} drivers out of ${total} total`);
    console.log('Drivers:', drivers.map(d => ({ id: d._id, name: d.name, email: d.email })));

    const response = {
      drivers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get driver by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver || !driver.isActive) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new driver
router.post('/', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('Creating driver with data:', req.body);
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    console.error('Driver creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    // Handle duplicate key errors (e.g., duplicate license number)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update driver
router.put('/:id', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete driver (soft delete)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update driver location
router.patch('/:id/location', auth, async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { currentLocation: { type: 'Point', coordinates } },
      { new: true }
    );
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available drivers near location
router.get('/nearby/:longitude/:latitude', auth, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.params; // maxDistance in meters
    
    const drivers = await Driver.find({
      isActive: true,
      isAvailable: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(10);
    
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
