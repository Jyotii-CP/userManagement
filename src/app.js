require('dotenv').config(); // Loads .env from root
const express = require('express');
const app = express();

const { sequelize } = require('./models'); // Load Sequelize instance from models
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Default route
app.get('/', (req, res) => res.json({ message: 'User management API' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // ⚠️ Only for development
    await sequelize.sync({ alter: true });
    console.log('✅ All models synced');

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Unable to connect to DB:', err);
    process.exit(1);
  }
})();
