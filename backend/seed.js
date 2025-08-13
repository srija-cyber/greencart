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
        name: 'Amit',
        email: 'amit@greencart.com',
        phone: '+91-98765-43210',
        licenseNumber: 'DL001',
        vehicleType: 'truck',
        vehicleCapacity: 5000,
        currentLocation: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        },
        isAvailable: true,
        rating: 4.5,
        totalDeliveries: 150,
        shiftHours: 6,
        pastWeekHours: [6, 8, 7, 7, 7, 6, 10]
      },
      {
        name: 'Priya',
        email: 'priya@greencart.com',
        phone: '+91-98765-43211',
        licenseNumber: 'DL002',
        vehicleType: 'van',
        vehicleCapacity: 2000,
        currentLocation: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai coordinates
        },
        isAvailable: true,
        rating: 4.8,
        totalDeliveries: 120,
        shiftHours: 6,
        pastWeekHours: [10, 9, 6, 6, 6, 7, 7]
      },
      {
        name: 'Rohit',
        email: 'rohit@greencart.com',
        phone: '+91-98765-43212',
        licenseNumber: 'DL003',
        vehicleType: 'truck',
        vehicleCapacity: 8000,
        currentLocation: {
          type: 'Point',
          coordinates: [88.3639, 22.5726] // Kolkata coordinates
        },
        isAvailable: false,
        rating: 4.2,
        totalDeliveries: 95,
        shiftHours: 10,
        pastWeekHours: [10, 6, 10, 7, 10, 9, 7]
      },
      {
        name: 'Neha',
        email: 'neha@greencart.com',
        phone: '+91-98765-43213',
        licenseNumber: 'DL004',
        vehicleType: 'van',
        vehicleCapacity: 2000,
        currentLocation: {
          type: 'Point',
          coordinates: [78.4867, 17.3850] // Hyderabad coordinates
        },
        isAvailable: true,
        rating: 4.6,
        totalDeliveries: 110,
        shiftHours: 9,
        pastWeekHours: [10, 8, 6, 7, 9, 8, 8]
      },
      {
        name: 'Karan',
        email: 'karan@greencart.com',
        phone: '+91-98765-43214',
        licenseNumber: 'DL005',
        vehicleType: 'truck',
        vehicleCapacity: 5000,
        currentLocation: {
          type: 'Point',
          coordinates: [75.7873, 26.9124] // Jaipur coordinates
        },
        isAvailable: true,
        rating: 4.3,
        totalDeliveries: 85,
        shiftHours: 7,
        pastWeekHours: [7, 8, 6, 6, 9, 6, 8]
      },
      {
        name: 'Sneha',
        email: 'sneha@greencart.com',
        phone: '+91-98765-43215',
        licenseNumber: 'DL006',
        vehicleType: 'van',
        vehicleCapacity: 2000,
        currentLocation: {
          type: 'Point',
          coordinates: [73.8567, 18.5204] // Pune coordinates
        },
        isAvailable: true,
        rating: 4.7,
        totalDeliveries: 130,
        shiftHours: 8,
        pastWeekHours: [10, 8, 6, 9, 10, 6, 9]
      },
      {
        name: 'Vikram',
        email: 'vikram@greencart.com',
        phone: '+91-98765-43216',
        licenseNumber: 'DL007',
        vehicleType: 'truck',
        vehicleCapacity: 8000,
        currentLocation: {
          type: 'Point',
          coordinates: [80.2707, 13.0827] // Chennai coordinates
        },
        isAvailable: false,
        rating: 4.1,
        totalDeliveries: 75,
        shiftHours: 6,
        pastWeekHours: [10, 8, 10, 8, 10, 7, 6]
      },
      {
        name: 'Anjali',
        email: 'anjali@greencart.com',
        phone: '+91-98765-43217',
        licenseNumber: 'DL008',
        vehicleType: 'van',
        vehicleCapacity: 2000,
        currentLocation: {
          type: 'Point',
          coordinates: [76.2673, 9.9312] // Kochi coordinates
        },
        isAvailable: true,
        rating: 4.4,
        totalDeliveries: 95,
        shiftHours: 6,
        pastWeekHours: [7, 8, 6, 7, 6, 9, 8]
      },
      {
        name: 'Manoj',
        email: 'manoj@greencart.com',
        phone: '+91-98765-43218',
        licenseNumber: 'DL009',
        vehicleType: 'truck',
        vehicleCapacity: 5000,
        currentLocation: {
          type: 'Point',
          coordinates: [85.8245, 20.2961] // Bhubaneswar coordinates
        },
        isAvailable: true,
        rating: 4.5,
        totalDeliveries: 105,
        shiftHours: 9,
        pastWeekHours: [8, 7, 8, 8, 7, 8, 6]
      },
      {
        name: 'Pooja',
        email: 'pooja@greencart.com',
        phone: '+91-98765-43219',
        licenseNumber: 'DL010',
        vehicleType: 'van',
        vehicleCapacity: 2000,
        currentLocation: {
          type: 'Point',
          coordinates: [82.2758, 17.6868] // Visakhapatnam coordinates
        },
        isAvailable: true,
        rating: 4.6,
        totalDeliveries: 115,
        shiftHours: 10,
        pastWeekHours: [7, 10, 7, 7, 9, 9, 8]
      }
    ];

    const savedDrivers = await Driver.insertMany(drivers);
    console.log('Created sample drivers');

    // Create sample routes
    const routes = [
      {
        name: 'Route 1',
        description: 'High traffic route with 25km distance',
        startLocation: {
          address: 'Delhi, India',
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        },
        endLocation: {
          address: 'Gurgaon, India',
          type: 'Point',
          coordinates: [77.0266, 28.4595]
        },
        estimatedDistance: 25,
        estimatedDuration: 125,
        trafficLevel: 'High',
        baseTimeMin: 125,
        assignedDriver: savedDrivers[0]._id,
        status: 'in-progress',
        priority: 'high'
      },
      {
        name: 'Route 2',
        description: 'High traffic route with 12km distance',
        startLocation: {
          address: 'Mumbai, India',
          type: 'Point',
          coordinates: [72.8777, 19.0760]
        },
        endLocation: {
          address: 'Thane, India',
          type: 'Point',
          coordinates: [72.9661, 19.2183]
        },
        estimatedDistance: 12,
        estimatedDuration: 48,
        trafficLevel: 'High',
        baseTimeMin: 48,
        assignedDriver: savedDrivers[1]._id,
        status: 'planned',
        priority: 'medium'
      },
      {
        name: 'Route 3',
        description: 'Low traffic route with 6km distance',
        startLocation: {
          address: 'Kolkata, India',
          type: 'Point',
          coordinates: [88.3639, 22.5726]
        },
        endLocation: {
          address: 'Howrah, India',
          type: 'Point',
          coordinates: [88.3103, 22.5958]
        },
        estimatedDistance: 6,
        estimatedDuration: 18,
        trafficLevel: 'Low',
        baseTimeMin: 18,
        assignedDriver: savedDrivers[2]._id,
        status: 'completed',
        priority: 'low'
      },
      {
        name: 'Route 4',
        description: 'Medium traffic route with 15km distance',
        startLocation: {
          address: 'Hyderabad, India',
          type: 'Point',
          coordinates: [78.4867, 17.3850]
        },
        endLocation: {
          address: 'Secunderabad, India',
          type: 'Point',
          coordinates: [78.5000, 17.4500]
        },
        estimatedDistance: 15,
        estimatedDuration: 60,
        trafficLevel: 'Medium',
        baseTimeMin: 60,
        assignedDriver: savedDrivers[3]._id,
        status: 'planned',
        priority: 'medium'
      },
      {
        name: 'Route 5',
        description: 'Low traffic route with 7km distance',
        startLocation: {
          address: 'Jaipur, India',
          type: 'Point',
          coordinates: [75.7873, 26.9124]
        },
        endLocation: {
          address: 'Sanganer, India',
          type: 'Point',
          coordinates: [75.8000, 26.8500]
        },
        estimatedDistance: 7,
        estimatedDuration: 35,
        trafficLevel: 'Low',
        baseTimeMin: 35,
        assignedDriver: savedDrivers[4]._id,
        status: 'in-progress',
        priority: 'low'
      },
      {
        name: 'Route 6',
        description: 'Low traffic route with 15km distance',
        startLocation: {
          address: 'Pune, India',
          type: 'Point',
          coordinates: [73.8567, 18.5204]
        },
        endLocation: {
          address: 'Pimpri, India',
          type: 'Point',
          coordinates: [73.8000, 18.6000]
        },
        estimatedDistance: 15,
        estimatedDuration: 75,
        trafficLevel: 'Low',
        baseTimeMin: 75,
        assignedDriver: savedDrivers[5]._id,
        status: 'planned',
        priority: 'medium'
      },
      {
        name: 'Route 7',
        description: 'Medium traffic route with 20km distance',
        startLocation: {
          address: 'Chennai, India',
          type: 'Point',
          coordinates: [80.2707, 13.0827]
        },
        endLocation: {
          address: 'Chengalpattu, India',
          type: 'Point',
          coordinates: [79.9833, 12.7000]
        },
        estimatedDistance: 20,
        estimatedDuration: 100,
        trafficLevel: 'Medium',
        baseTimeMin: 100,
        assignedDriver: savedDrivers[6]._id,
        status: 'completed',
        priority: 'high'
      },
      {
        name: 'Route 8',
        description: 'Low traffic route with 19km distance',
        startLocation: {
          address: 'Kochi, India',
          type: 'Point',
          coordinates: [76.2673, 9.9312]
        },
        endLocation: {
          address: 'Alappuzha, India',
          type: 'Point',
          coordinates: [76.3274, 9.4981]
        },
        estimatedDistance: 19,
        estimatedDuration: 76,
        trafficLevel: 'Low',
        baseTimeMin: 76,
        assignedDriver: savedDrivers[7]._id,
        status: 'planned',
        priority: 'medium'
      },
      {
        name: 'Route 9',
        description: 'Low traffic route with 9km distance',
        startLocation: {
          address: 'Bhubaneswar, India',
          type: 'Point',
          coordinates: [85.8245, 20.2961]
        },
        endLocation: {
          address: 'Cuttack, India',
          type: 'Point',
          coordinates: [85.8812, 20.4625]
        },
        estimatedDistance: 9,
        estimatedDuration: 45,
        trafficLevel: 'Low',
        baseTimeMin: 45,
        assignedDriver: savedDrivers[8]._id,
        status: 'in-progress',
        priority: 'low'
      },
      {
        name: 'Route 10',
        description: 'High traffic route with 22km distance',
        startLocation: {
          address: 'Visakhapatnam, India',
          type: 'Point',
          coordinates: [82.2758, 17.6868]
        },
        endLocation: {
          address: 'Vizianagaram, India',
          type: 'Point',
          coordinates: [83.4167, 18.1167]
        },
        estimatedDistance: 22,
        estimatedDuration: 88,
        trafficLevel: 'High',
        baseTimeMin: 88,
        assignedDriver: savedDrivers[9]._id,
        status: 'planned',
        priority: 'high'
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
          address: '123 Tech Street, Delhi, India',
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        },
        deliveryAddress: {
          address: '456 Innovation Ave, Gurgaon, India',
          type: 'Point',
          coordinates: [77.0266, 28.4595]
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
        valueRs: 2594,
        routeId: 7,
        deliveryTime: '02:07',
        assignedDriver: savedDrivers[0]._id,
        assignedRoute: savedRoutes[6]._id,
        status: 'in-transit',
        priority: 'high',
        estimatedDeliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'GC000002',
        customerName: 'Green Foods Co.',
        customerEmail: 'logistics@greenfoods.com',
        customerPhone: '+1-555-0202',
        pickupAddress: {
          address: '789 Farm Road, Mumbai, India',
          type: 'Point',
          coordinates: [72.8777, 19.0760]
        },
        deliveryAddress: {
          address: '321 Market Street, Thane, India',
          type: 'Point',
          coordinates: [72.9661, 19.2183]
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
        valueRs: 1835,
        routeId: 6,
        deliveryTime: '01:19',
        assignedDriver: savedDrivers[1]._id,
        assignedRoute: savedRoutes[5]._id,
        status: 'pending',
        priority: 'medium',
        estimatedDeliveryTime: new Date(Date.now() + 48 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'GC000003',
        customerName: 'Tech Solutions',
        customerEmail: 'orders@techsolutions.com',
        customerPhone: '+1-555-0203',
        pickupAddress: {
          address: '456 Tech Park, Kolkata, India',
          type: 'Point',
          coordinates: [88.3639, 22.5726]
        },
        deliveryAddress: {
          address: '789 Business Ave, Howrah, India',
          type: 'Point',
          coordinates: [88.3103, 22.5958]
        },
        items: [
          {
            name: 'Smartphones',
            quantity: 25,
            weight: 0.3,
            dimensions: { length: 15, width: 8, height: 2 }
          }
        ],
        totalWeight: 7.5,
        totalVolume: 600,
        valueRs: 766,
        routeId: 9,
        deliveryTime: '01:06',
        assignedDriver: savedDrivers[2]._id,
        assignedRoute: savedRoutes[8]._id,
        status: 'delivered',
        priority: 'low',
        estimatedDeliveryTime: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'GC000004',
        customerName: 'Fashion Hub',
        customerEmail: 'orders@fashionhub.com',
        customerPhone: '+1-555-0204',
        pickupAddress: {
          address: '123 Fashion Street, Hyderabad, India',
          type: 'Point',
          coordinates: [78.4867, 17.3850]
        },
        deliveryAddress: {
          address: '456 Style Ave, Secunderabad, India',
          type: 'Point',
          coordinates: [78.5000, 17.4500]
        },
        items: [
          {
            name: 'Designer Clothes',
            quantity: 100,
            weight: 0.5,
            dimensions: { length: 30, width: 20, height: 5 }
          }
        ],
        totalWeight: 50,
        totalVolume: 3000,
        valueRs: 572,
        routeId: 1,
        deliveryTime: '02:02',
        assignedDriver: savedDrivers[3]._id,
        assignedRoute: savedRoutes[0]._id,
        status: 'in-transit',
        priority: 'medium',
        estimatedDeliveryTime: new Date(Date.now() + 12 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'GC000005',
        customerName: 'Home Decor',
        customerEmail: 'orders@homedecor.com',
        customerPhone: '+1-555-0205',
        pickupAddress: {
          address: '789 Decor Lane, Jaipur, India',
          type: 'Point',
          coordinates: [75.7873, 26.9124]
        },
        deliveryAddress: {
          address: '321 Art Street, Sanganer, India',
          type: 'Point',
          coordinates: [75.8000, 26.8500]
        },
        items: [
          {
            name: 'Home Decor Items',
            quantity: 75,
            weight: 1.0,
            dimensions: { length: 25, width: 20, height: 15 }
          }
        ],
        totalWeight: 75,
        totalVolume: 5625,
        valueRs: 826,
        routeId: 3,
        deliveryTime: '00:35',
        assignedDriver: savedDrivers[4]._id,
        assignedRoute: savedRoutes[2]._id,
        status: 'delivered',
        priority: 'low',
        estimatedDeliveryTime: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    // Add more orders to match the 50 orders data provided
    for (let i = 6; i <= 50; i++) {
      const routeIndex = (i - 1) % 10; // Cycle through routes 1-10
      const driverIndex = routeIndex % 10; // Assign drivers based on route
      
      orders.push({
        orderNumber: `GC${String(i).padStart(6, '0')}`,
        customerName: `Customer ${i}`,
        customerEmail: `customer${i}@example.com`,
        customerPhone: `+91-98765-${String(i).padStart(5, '0')}`,
        pickupAddress: {
          address: `Pickup Address ${i}`,
          type: 'Point',
          coordinates: [77.2090 + (i * 0.01), 28.6139 + (i * 0.01)]
        },
        deliveryAddress: {
          address: `Delivery Address ${i}`,
          type: 'Point',
          coordinates: [77.0266 + (i * 0.01), 28.4595 + (i * 0.01)]
        },
        items: [
          {
            name: `Item ${i}`,
            quantity: Math.floor(Math.random() * 100) + 1,
            weight: Math.random() * 5 + 0.5,
            dimensions: { length: 20 + i, width: 15 + i, height: 10 + i }
          }
        ],
        totalWeight: Math.floor(Math.random() * 200) + 10,
        totalVolume: Math.floor(Math.random() * 5000) + 100,
        valueRs: Math.floor(Math.random() * 3000) + 200,
        routeId: routeIndex + 1,
        deliveryTime: `${String(Math.floor(Math.random() * 3)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        assignedDriver: savedDrivers[driverIndex]._id,
        assignedRoute: savedRoutes[routeIndex]._id,
        status: ['pending', 'in-transit', 'delivered'][Math.floor(Math.random() * 3)],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        estimatedDeliveryTime: new Date(Date.now() + (Math.floor(Math.random() * 72) + 1) * 60 * 60 * 1000)
      });
    }

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
