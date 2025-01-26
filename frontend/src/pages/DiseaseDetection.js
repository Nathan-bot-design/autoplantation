import React from "react";
import { Line } from "react-chartjs-2";
import { FaSeedling } from "react-icons/fa";
import "./DiseaseDetection.css";

const DiseaseDetection = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Disease Occurrences",
        data: [65, 59, 80, 81, 56, 55],
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  };

  return (
    <div className="disease-detection-container">
      <div className="header">
        <FaSeedling />
        <h1>Disease Detection</h1>
      </div>

      <div className="content">
        <div className="image-container">
          <img
            src="path_to_your_disease_image.jpg" // Replace with your image path
            alt="Disease Detected"
            className="disease-image"
          />
        </div>

        <div className="statistics">
          <h3>Statistics of Disease Occurrence</h3>
          <Line data={data} />
        </div>

        <div className="description">
          <p>
            The detected disease is affecting the leaves, causing yellowing and wilting. This may
            lead to reduced photosynthesis and lower crop yield.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
