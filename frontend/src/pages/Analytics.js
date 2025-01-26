import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";

const Analytics = () => {
    const [sensorData, setSensorData] = useState({
        timestamps: [],
        temperature: [],
        humidity: [],
        soilMoisture: [],
        lightIntensity: []
    });

    const fetchData = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:5000/api/analytics");
            const data = res.data;

            // Extract data
            const timestamps = data.map(item => item.timestamp);
            const temperature = data.map(item => item.temperature);
            const humidity = data.map(item => item.humidity);
            const soilMoisture = data.map(item => item.soil_moisture);
            const lightIntensity = data.map(item => item.light_intensity);

            setSensorData({ timestamps, temperature, humidity, soilMoisture, lightIntensity });
        } catch (error) {
            console.error("Error fetching sensor data:", error);
            setSensorData({ timestamps: [], temperature: [], humidity: [], soilMoisture: [], lightIntensity: [] });
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval);
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const formatChartData = (label, data, color) => ({
        labels: sensorData.timestamps.length > 0 ? sensorData.timestamps : ["No data"],
        datasets: [
            {
                label,
                data,
                borderColor: color,
                backgroundColor: `rgba(${hexToRgb(color)}, 0.1)`,
            },
        ],
    });

    const hexToRgb = (hex) => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r}, ${g}, ${b}`;
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: "20px",
                padding: "20px",
                maxWidth: "1200px",
                margin: "0 auto",
            }}
        >
            {/* Temperature Over Time */}
            <div
                style={{
                    gridColumn: "1 / 2",
                    gridRow: "1 / 2",
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "5px",
                }}
            >
                <h2>Temperature Over Time</h2>
                <Line
                    data={formatChartData(
                        "Temperature",
                        sensorData.temperature,
                        "#FF6384"
                    )}
                    options={chartOptions}
                />
            </div>

            {/* Humidity Over Time */}
            <div
                style={{
                    gridColumn: "2 / 3",
                    gridRow: "1 / 2",
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "5px",
                }}
            >
                <h2>Humidity Over Time</h2>
                <Line
                    data={formatChartData(
                        "Humidity",
                        sensorData.humidity,
                        "#36A2EB"
                    )}
                    options={chartOptions}
                />
            </div>

            {/* Soil Moisture Over Time */}
            <div
                style={{
                    gridColumn: "1 / 2",
                    gridRow: "2 / 3",
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "5px",
                }}
            >
                <h2>Soil Moisture Over Time</h2>
                <Line
                    data={formatChartData(
                        "Soil Moisture",
                        sensorData.soilMoisture,
                        "#4BC0C0"
                    )}
                    options={chartOptions}
                />
            </div>

            {/* Light Intensity Over Time */}
            <div
                style={{
                    gridColumn: "2 / 3",
                    gridRow: "2 / 3",
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "5px",
                }}
            >
                <h2>Light Intensity Over Time</h2>
                <Line
                    data={formatChartData(
                        "Light Intensity",
                        sensorData.lightIntensity,
                        "#FFCE56"
                    )}
                    options={chartOptions}
                />
            </div>
        </div>
    );
};

export default Analytics;
