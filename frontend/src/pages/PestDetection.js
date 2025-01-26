import React from "react";
import { Line } from "react-chartjs-2";
import { FaBug } from "react-icons/fa";
import "./PestDetection.css";

const PestDetection = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Pest Occurrences",
        data: [50, 55, 60, 70, 65, 90],
        borderColor: "rgba(255,99,132,1)",
        fill: false,
      },
    ],
  };

  return (
    <div className="pest-detection-container">
      <div className="header">
        <FaBug />
        <h1>Pest Detection</h1>
      </div>

      <div className="content">
        <div className="image-container">
          <img
            src="path_to_your_pest_image.jpg" // Replace with your image path
            alt="Pest Detected"
            className="pest-image"
          />
        </div>

        <div className="statistics">
          <h3>Statistics of Pest Occurrence</h3>
          <Line data={data} />
        </div>

        <div className="description">
          <p>
            A crop pest has been detected in the field, leading to significant damage to the leaves
            and stems. Immediate action is recommended to control the infestation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PestDetection;
