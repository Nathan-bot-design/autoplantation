import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Alerts.css';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch unresolved alerts from the backend
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/alerts');
        setAlerts(response.data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const resolveAlert = async (alertId) => {
    try {
      await axios.post('http://localhost:5000/api/resolve-alert', { id: alertId });
      setAlerts(alerts.filter((alert) => alert.id !== alertId)); // Remove resolved alert from the list
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <div className="alerts-container">
      <h1>Active Alerts</h1>
      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p>No active alerts at the moment.</p>
      ) : (
        <div className="alert-list">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-item ${alert.type === 'Critical' ? 'critical' : 'warning'}`}
            >
              <p>
                <strong>Type:</strong> {alert.type}
              </p>
              <p>
                <strong>Message:</strong> {alert.message}
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date(alert.timestamp).toLocaleString()}
              </p>
              <button onClick={() => resolveAlert(alert.id)} className="resolve-button">
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
