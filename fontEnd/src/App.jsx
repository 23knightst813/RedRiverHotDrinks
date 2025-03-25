import { useState, useEffect } from "react";
import "./App.css";
import plusIcon from "./assets/PlusIcon.svg";

// This component is a loading spinner that cycles through a set of frames providing viusal feedback to the user
function LoadingSpinner() {
  const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % spinnerFrames.length);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return <span className="loading-spinner">{spinnerFrames[frameIndex]}</span>;
}

// This component is a popup that displays the steps required to make a drink
function Popup({ title, steps, onClose }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, currentStep]);
        setCurrentStep((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length]);

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h4>{title}</h4>
        {steps.map((step, index) => (
          <div key={index} className="step-row">
            <span className="step-indicator">
              {completedSteps.includes(index) ? (
                "✔"
              ) : currentStep === index ? (
                <LoadingSpinner />
              ) : (
                ""
              )}
            </span>
            <p>{step}</p>
          </div>
        ))}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// This is the main App component that displays a list of drinks and handles the selection of a drink
function App() {
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [drinks, setDrinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch drinks from API
  useEffect(() => {
    async function fetchDrinks() {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/drinks`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDrinks(data);
      } catch (e) {
        console.error("Error fetching drinks:", e);
        setError("Failed to load drinks. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDrinks();
  }, []);

  // Handles the click event for a drink, setting the selected drink
  const handleDrinkClick = (drinkName) => {
    setSelectedDrink(drinkName);
  };
  
  // Handles the closing of the popup by setting the selected drink to null
  const handleClosePopup = () => {
    setSelectedDrink(null);
  };

  // Return the main App component with a title, a list of drinks, and a popup for the selected drink
  return (
    <div>
      <h1>Hot Drinks Maker 5000</h1>
      
      {loading && <p>Loading drinks...</p>}
      {error && <p className="error">{error}</p>}
      
      <div className="drinks-container">
        {!loading && Object.keys(drinks).map((drinkName) => (
          <h2
            key={drinkName}
            onClick={() => handleDrinkClick(drinkName)}
          >
            {drinkName}
          </h2>
        ))}
      </div>
      
      {selectedDrink && (
        <Popup
          title={selectedDrink}
          steps={drinks[selectedDrink]}
          onClose={handleClosePopup}
        />
      )}
      
      <div title="Coming soon">
        <img src={plusIcon} alt="Plus" className="plus-icon" />
      </div>
    </div>
  );
}

export default App;
