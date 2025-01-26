import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RemoteControl.css";

const RemoteControl = () => {
  const [status, setStatus] = useState("OFF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pump status from the backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/pump-status");
        setStatus(response.data.status);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pump status:", error);
        setError("Failed to fetch pump status. Please check the backend.");
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // Toggle pump status
  const togglePump = async () => {
    const newStatus = status === "ON" ? "OFF" : "ON";
    try {
      setLoading(true);
      const espUrl = `http://192.168.0.101/pump?state=${newStatus}`;
      await axios.get(espUrl);
      setStatus(newStatus);
      setLoading(false);
    } catch (error) {
      console.error("Error toggling pump status:", error);
      alert("Failed to toggle pump. Please check ESP connection.");
      setLoading(false);
    }
  };

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="remote-control-container">
      <h1 className="title">Smart Pump Control</h1>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <>
          <div className="status-container">
            <p className="status-text">
              Pump Status: <strong>{status}</strong>
            </p>
          </div>
          <button
            onClick={togglePump}
            className={`toggle-button ${status === "ON" ? "button-on" : "button-off"}`}
          >
            Turn {status === "ON" ? "OFF" : "ON"}
          </button>
        </>
      )}
    </div>
  );
};

export default RemoteControl;
