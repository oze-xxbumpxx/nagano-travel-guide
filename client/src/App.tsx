import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TravelPlans from "./pages/TravelPlans";
import CreateTravelPlan from "./pages/createTravelPlan";
import EditTravelPlan from "./pages/editTravelPlan";
import Accommodations from "./pages/Accommodations";
import CreateAccommodation from "./pages/CreateAccommodation";
import EditAccommodation from "./pages/EditAccommodation";
import Attractions from "./pages/Attractions";
import CreateAttraction from "./pages/CreateAttraction";
import EditAttraction from "./pages/EditAttraction";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/travel-plans" element={<TravelPlans />} />
            <Route path="/create-travel-plan" element={<CreateTravelPlan />} />
            <Route path="/edit-travel-plan/:id" element={<EditTravelPlan />} />
            <Route path="/accommodations" element={<Accommodations />} />
            <Route
              path="/create-accommodation"
              element={<CreateAccommodation />}
            />
            <Route
              path="/edit-accommodation/:id"
              element={<EditAccommodation />}
            />
            <Route path="/attractions" element={<Attractions />} />
            <Route path="/create-attraction" element={<CreateAttraction />} />
            <Route path="/edit-attraction/:id" element={<EditAttraction />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
