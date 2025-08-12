import mongoose from 'mongoose';
import User from './models/User.js';
import Driver from './models/Driver.js';
import Route from './models/Route.js';
import Order from './models/Order.js';
import config from './config.js';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Route.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@greencart.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create manager user
    const managerUser = new User({
      username: 'manager',
      email: 'manager@greencart.com',
      password: 'manager123',
      role: 'manager'
    });
    await managerUser.save();
    console.log('Created manager user');

    // Create dispatcher user
    const dispatcherUser = new User({
      username: 'dispatcher',
      email: 'dispatcher@greencart.com',
      password: 'dispatcher123',
      role: 'dispatcher'
    });
    await dispatcherUser.save();
    console.log('Created dispatcher user');

    // Create sample drivers
    const drivers = [
      {
        name: 'John Smith',
        email: 'john.smith@greencart.com',
        phone: '+1-555-0101',
        licenseNumber: 'DL123456',
        vehicleType: 'truck',
        vehicleCapacity: 5000,
        currentLocation: {
          type: 'Point',
          coordinates: [-74.006, 40.7128] // New York coordinates
        },
        isAvailable: true,
        rating: 4.5,
        totalDeliveries: 150
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@greencart.com',
        phone: '+1-555-0102',
        licenseNumber: 'DL123457',
        vehicleType: 'van',
        vehicleCapacity: 2000,
        currentLocation: {
          type: 'Point',
          coordinates: [-87.6298, 41.8781] // Chicago coordinates
        },
        isAvailable: true,
        rating: 4.8,
        totalDeliveries: 120
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@greencart.com',
        phone: '+1-555-0103',
        licenseNumber: 'DL123458',
        vehicleType: 'truck',
        vehicleCapacity: 8000,
        currentLocation: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522] // Los Angeles coordinates
        },
        isAvailable: false,
        rating: 4.2,
        totalDeliveries: 95
      }
    ];

    const savedDrivers = await Driver.insertMany(drivers);
    console.log('Created sample drivers');

    // Create sample routes
    const routes = [
      {
        name: 'East Coast Express',
        description: 'Fast delivery route from NYC to Boston',
        startLocation: {
          address: 'New York, NY',
          type: 'Point',
          coordinates: [-74.006, 40.7128]
        },
        endLocation: {
          address: 'Boston, MA',
          type: 'Point',
          coordinates: [-71.0589, 42.3601]
        },
        estimatedDistance: 215,
        estimatedDuration: 240,
        assignedDriver: savedDrivers[0]._id,
        status: 'in-progress',
        priority: 'high'
      },
      {
        name: 'Midwest Circuit',
        description: 'Chicago to Detroit delivery route',
        startLocation: {
          address: 'Chicago, IL',
          type: 'Point',
          coordinates: [-87.6298, 41.8781]
        },
        endLocation: {
          address: 'Detroit, MI',
          type: 'Point',
          coordinates: [-83.0458, 42.3314]
        },
        estimatedDistance: 280,
        estimatedDuration: 300,
        assignedDriver: savedDrivers[1]._id,
        status: 'planned',
        priority: 'medium'
      }
    ];

    const savedRoutes = await Route.insertMany(routes);
    console.log('Created sample routes');

    // Create sample orders
    const orders = [
      {
        orderNumber: 'GC000001',
        customerName: 'ABC Electronics',
        customerEmail: 'orders@abcelectronics.com',
        customerPhone: '+1-555-0201',
        pickupAddress: {
          address: '123 Tech Street, New York, NY',
          type: 'Point',
          coordinates: [-74.006, 40.7128]
        },
        deliveryAddress: {
          address: '456 Innovation Ave, Boston, MA',
          type: 'Point',
          coordinates: [-71.0589, 42.3601]
        },
        items: [
          {
            name: 'Laptop Computers',
            quantity: 50,
            weight: 2.5,
            dimensions: { length: 35, width: 25, height: 5 }
          }
        ],
        totalWeight: 125,
        totalVolume: 4375,
        assignedDriver: savedDrivers[0]._id,
        assignedRoute: savedRoutes[0]._id,
        status: 'in-transit',
        priority: 'high',
        estimatedDeliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      {
        orderNumber: 'GC000002',
        customerName: 'Green Foods Co.',
        customerEmail: 'logistics@greenfoods.com',
        customerPhone: '+1-555-0202',
        pickupAddress: {
          address: '789 Farm Road, Chicago, IL',
          type: 'Point',
          coordinates: [-87.6298, 41.8781]
        },
        deliveryAddress: {
          address: '321 Market Street, Detroit, MI',
          type: 'Point',
          coordinates: [-83.0458, 42.3314]
        },
        items: [
          {
            name: 'Organic Vegetables',
            quantity: 200,
            weight: 0.5,
            dimensions: { length: 20, width: 15, height: 10 }
          }
        ],
        totalWeight: 100,
        totalVolume: 3000,
        assignedDriver: savedDrivers[1]._id,
        assignedRoute: savedRoutes[1]._id,
        status: 'pending',
        priority: 'medium',
        estimatedDeliveryTime: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now
      }
    ];

    await Order.insertMany(orders);
    console.log('Created sample orders');

    console.log('Seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin / admin123');
    console.log('Manager: manager / manager123');
    console.log('Dispatcher: dispatcher / dispatcher123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedData();
