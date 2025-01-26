// Backend Update with Alerts Handling
const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'magicD53@',
  database: 'cropmonitoring11'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Constants for thresholds
const thresholds = {
  temperature: { min: 15, max: 40 },
  humidity: { min: 30, max: 90 },
  light_intensity: { min: 100, max: 1000 },
  soil_moisture: { min: 300, max: 1000 }
};

// Helper function to create alerts
function createAlert(type, value) {
  const message = `Alert: ${type} is ${value < thresholds[type].min ? 'too low' : 'too high'} (${value}).`;
  const query = 'INSERT INTO alerts (type, message, timestamp) VALUES (?, ?, CURRENT_TIMESTAMP)';

  db.query(query, [type, message], err => {
    if (err) {
      console.error('Error inserting alert:', err);
    } else {
      console.log(`Alert created for ${type}: ${message}`);
    }
  });
}

// Routes
app.post('/api/sensor-data', (req, res) => {
  const { temperature, humidity, lightIntensity, soilMoisture, pumpStatus } = req.body;

  if (!temperature || !humidity || !lightIntensity || !soilMoisture) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO sensor_readings (temperature, humidity, light_intensity, soil_moisture, pump_status)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [temperature, humidity, lightIntensity, soilMoisture, pumpStatus || 'OFF'];

  db.query(query, values, err => {
    if (err) {
      console.error('Error inserting sensor data:', err);
      return res.status(500).json({ error: 'Failed to store sensor data' });
    }

    // Check thresholds and create alerts
    if (temperature < thresholds.temperature.min || temperature > thresholds.temperature.max) {
      createAlert('temperature', temperature);
    }
    if (humidity < thresholds.humidity.min || humidity > thresholds.humidity.max) {
      createAlert('humidity', humidity);
    }
    if (lightIntensity < thresholds.light_intensity.min || lightIntensity > thresholds.light_intensity.max) {
      createAlert('light_intensity', lightIntensity);
    }
    if (soilMoisture < thresholds.soil_moisture.min || soilMoisture > thresholds.soil_moisture.max) {
      createAlert('soil_moisture', soilMoisture);
    }

    res.status(200).json({ message: 'Sensor data stored and alerts checked successfully' });
  });
});
app.get('/api/analytics', (req, res) => {
    const query = 'SELECT * FROM sensor_readings ORDER BY timestamp DESC';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching sensor data:', err);
        return res.status(500).json({ error: 'Failed to fetch sensor data' });
      }
      res.status(200).json(results);
    });
  });
  
  /**
   * Route: GET /api/crop-images
   * Description: Fetches all crop images for the dashboard, sorted by the latest timestamp.
   */
  app.get('/api/crop-images', (req, res) => {
    const query = 'SELECT * FROM crop_images ORDER BY timestamp DESC';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching crop images:', err);
        return res.status(500).json({ error: 'Failed to fetch crop images' });
      }
  
      const formattedResults = results.map(image => ({
        id: image.id,
        imagePath: `http://localhost:5000/${image.image_path}`
      }));
      res.status(200).json(formattedResults);
    });
  });

app.get('/api/alerts', (req, res) => {
  const query = 'SELECT * FROM alerts ORDER BY timestamp DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching alerts:', err);
      return res.status(500).json({ error: 'Failed to fetch alerts' });
    }
    res.status(200).json(results);
  });
});
// Fetch pump status
app.get("/api/pump-status", (req, res) => {
    const query = "SELECT pump_status FROM sensor_readings ORDER BY timestamp DESC LIMIT 1";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching pump status:", err);
        return res.status(500).json({ error: "Failed to fetch pump status" });
      }
      const pumpStatus = results[0]?.pump_status || "OFF";
      res.status(200).json({ status: pumpStatus });
    });
  });

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
