const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { sequelize } = require('./models');

const app = express();

app.use(cors({
  origin: [process.env.EC_REACT_APP],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Configuración de archivos estáticos (React dist)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'API Eletrican Control running...' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/meters', require('./routes/meters'));
app.use('/api/consumptions', require('./routes/consumptions'));

// Manejo de todas las demás rutas (SPA - React Router)
app.get(/.*/, (req, res) => {
  // Asegurarse de no capturar rutas que comiencen con /api
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).json({error: 'Error al cargar la aplicación.'});
    }
  });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate().then(() => {
  console.log('Database connected successfully');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to the database:', err);
});
