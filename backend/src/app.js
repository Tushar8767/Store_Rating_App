require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:8080,http://127.0.0.1:8080').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for local load balancer demonstration
    }
  },
  credentials: true
}));
app.use(express.json());

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
