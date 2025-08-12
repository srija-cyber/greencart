export default {
  PORT: process.env.PORT || 5000,
  MONGODB_URI:'mongodb://localhost:27017/greencart',
  JWT_SECRET: process.env.JWT_SECRET || 'greencart-super-secret-jwt-key-2024',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
