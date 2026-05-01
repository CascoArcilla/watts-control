const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize } = require('./models');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Basic route test
app.get('/api/health', (req, res) => {
  res.json({ status: 'API Eletrican Control running...' });
});

// Routes placeholders
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/meters', require('./routes/meters'));
// app.use('/api/consumptions', require('./routes/consumptions'));

const PORT = process.env.PORT || 5000;

sequelize.authenticate().then(() => {
  console.log('Database connected successfully');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to the database:', err);
});
