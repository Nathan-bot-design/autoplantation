import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import RemoteControl from "./pages/RemoteControl";
import DiseaseDetection from "./pages/DiseaseDetection"; // Import the Disease Detection page
import PestDetection from "./pages/PestDetection"; // Import the Pest Detection page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/remote-control" element={<RemoteControl />} />
        <Route path="/disease-detection" element={<DiseaseDetection />} /> {/* Add this line */}
        <Route path="/pest-detection" element={<PestDetection />} /> {/* Add this line */}
      </Routes>
    </Router>
  );
}

export default App;
