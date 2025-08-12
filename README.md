# GreenCart Logistics - Full Stack Application

A comprehensive logistics management system built with React, Node.js, Express, and MongoDB.

## Features

- **Authentication**: JWT-based login system with role-based access control
- **Dashboard**: Real-time metrics and charts using Recharts
- **Driver Management**: CRUD operations for driver information
- **Route Management**: Delivery route planning and assignment
- **Order Management**: Complete order lifecycle management
- **Real-time Simulation**: Live updates and monitoring
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

### Frontend
- React 19 with Hooks
- React Router DOM for navigation
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API communication

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Role-based access control
- RESTful API design

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd greencart-frontend
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Set up MongoDB
- Install MongoDB locally or use MongoDB Atlas
- Create a database named `greencart`
- Update the connection string in `backend/config.js` if needed

### 5. Seed the database (optional)
```bash
cd backend
node seed.js
cd ..
```

This will create:
- Admin user: `admin` / `admin123`
- Manager user: `manager` / `manager123`
- Dispatcher user: `dispatcher` / `dispatcher123`
- Sample drivers, routes, and orders

## Running the Application

### 1. Start the backend server
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### 2. Start the frontend development server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access the application
Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get driver by ID
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver
- `PATCH /api/drivers/:id/location` - Update driver location
- `GET /api/drivers/nearby/:longitude/:latitude` - Get nearby drivers

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get route by ID
- `POST /api/routes` - Create new route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route
- `PATCH /api/routes/:id/status` - Update route status
- `PATCH /api/routes/:id/assign-driver` - Assign driver to route

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/assign-driver` - Assign driver to order
- `PATCH /api/orders/:id/assign-route` - Assign route to order

## Project Structure

```
greencart-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx      # Navigation component
│   │   ├── ChartCard.jsx   # Chart wrapper component
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx # Authentication context
│   ├── pages/               # Page components
│   │   ├── Login.jsx       # Login page
│   │   ├── Dashboard.jsx   # Dashboard page
│   │   ├── Drivers.jsx     # Drivers management
│   │   ├── Routes.jsx      # Routes management
│   │   ├── Orders.jsx      # Orders management
│   │   └── Simulation.jsx  # Real-time simulation
│   ├── services/            # API services
│   │   └── api.js          # API communication
│   ├── App.jsx             # Main app component
│   └── main.jsx            # App entry point
├── backend/
│   ├── models/              # MongoDB models
│   │   ├── User.js         # User model
│   │   ├── Driver.js       # Driver model
│   │   ├── Route.js        # Route model
│   │   └── Order.js        # Order model
│   ├── routes/              # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── drivers.js      # Driver routes
│   │   ├── routes.js       # Route routes
│   │   └── orders.js       # Order routes
│   ├── middleware/          # Custom middleware
│   │   └── auth.js         # JWT authentication
│   ├── config.js            # Configuration
│   ├── server.js            # Express server
│   └── seed.js              # Database seeding
└── README.md
```

## Role-Based Access Control

- **Admin**: Full access to all features
- **Manager**: Can manage drivers, routes, and orders
- **Dispatcher**: Can view and update order status

## Development

### Adding new features
1. Create the backend model and routes
2. Add API service functions in `src/services/api.js`
3. Create the frontend component
4. Add the route to `App.jsx`
5. Update the navigation in `Navbar.jsx`

### Styling
The application uses Tailwind CSS for styling. Custom styles can be added in `src/index.css`.

### State Management
Authentication state is managed using React Context (`AuthContext`). For more complex state, consider adding additional contexts or using a state management library.

## Deployment

### Backend
1. Set environment variables for production
2. Build and deploy to your preferred hosting service
3. Ensure MongoDB connection is configured

### Frontend
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update API base URL in `src/services/api.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
