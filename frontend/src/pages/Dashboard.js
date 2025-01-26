import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaTachometerAlt, FaChartBar, FaBell, FaBug, FaSeedling } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    brightness: 0,
    pumpStatus: "OFF",
  });

  const [cropImages, setCropImages] = useState([]);
  const intervalRef = useRef(null);

  // Fetch data from APIs
  const fetchData = async () => {
    try {
      // Fetch latest sensor readings
      const sensorRes = await axios.get("http://localhost:5000/api/analytics");
      const latestSensorData = sensorRes.data[0]; // Get the latest record
      if (latestSensorData) {
        setSensorData({
          temperature: latestSensorData.temperature,
          humidity: latestSensorData.humidity,
          soilMoisture: latestSensorData.soil_moisture,
          brightness: latestSensorData.light_intensity,
          pumpStatus: latestSensorData.pump_status || "OFF",
        });
      }

      // Fetch crop images
      const cropRes = await axios.get("http://localhost:5000/api/crop-images");
      const imagePaths = cropRes.data.map((image) => `http://localhost:5000/${image.image_path}`);
      setCropImages(imagePaths);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Set up interval to fetch data periodically
  useEffect(() => {
    let mounted = true;
    fetchData();

    intervalRef.current = setInterval(() => {
      if (mounted) fetchData();
    }, 5000);

    return () => {
      clearInterval(intervalRef.current);
      mounted = false;
    };
  }, []);

  const { temperature, humidity, soilMoisture, brightness, pumpStatus } = sensorData;

  return (
    <div className="dashboard-container">
      {/* Navigation */}
      <nav className="navigation">
        <NavButton to="/analytics" icon={<FaChartBar />} label="Analytics" />
        <NavButton to="/alerts" icon={<FaBell />} label="Alerts" />
        <NavButton to="/remote-control" icon={<FaTachometerAlt />} label="Pump Control" />
        <NavButton to="/disease-detection" icon={<FaSeedling />} label="Disease Detection" />
        <NavButton to="/pest-detection" icon={<FaBug />} label="Pest Detection" />
      </nav>

      {/* Sensor Data */}
      <div className="sensor-data-grid">
        <SensorCard title="Temperature" value={`${temperature} °C`} />
        <SensorCard title="Humidity" value={`${humidity} %`} />
        <SensorCard title="Soil Moisture" value={`${soilMoisture}`} />
        <SensorCard title="Brightness" value={`${brightness} `} />
        <SensorCard title="Pump Status" value={pumpStatus} />
        <CropImageSection images={cropImages} />
      </div>
    </div>
  );
};

// Reusable Navigation Button Component
const NavButton = ({ to, icon, label }) => (
  <Link to={to} className="nav-button">
    <div className="nav-icon">{icon}</div>
    <span>{label}</span>
  </Link>
);

// Reusable Sensor Card Component
const SensorCard = ({ title, value }) => (
  <div className="sensor-card">
    <h2>{title}</h2>
    <p>{value}</p>
  </div>
);

// Crop Image Section Component
const CropImageSection = ({ images }) => (
  <div className="crop-image-section">
    <h3>Crop Images</h3>
    <div className="image-grid">
      {images.map((url, index) => (
        <img key={index} src={url} alt={`Crop ${index + 1}`} className="crop-image" />
      ))}
    </div>
  </div>
);

export default Dashboard;
