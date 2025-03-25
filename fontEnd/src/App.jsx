import { useState, useEffect } from "react";
import "./App.css";
import plusIcon from "./assets/PlusIcon.svg";

const backendUrl = import.meta.env.VITE_BACKEND_URL;


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

// New component for adding a new drink
function AddDrinkPopup({ onClose, onDrinkAdded }) {
  const [drinkName, setDrinkName] = useState("");
  const [steps, setSteps] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const updateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!drinkName.trim()) {
      setError("Please enter a drink name");
      return;
    }
    
    // Filter out empty steps
    const filteredSteps = steps.filter(step => step.trim() !== "");
    if (filteredSteps.length === 0) {
      setError("Please add at least one step");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendUrl}/drinks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: drinkName.trim(),
          steps: filteredSteps,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add drink");
      }
      
      // Call the callback to refresh drinks
      onDrinkAdded();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add drink. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h4>Add New Drink</h4>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="drinkName">Drink Name:</label>
            <input
              type="text"
              id="drinkName"
              value={drinkName}
              onChange={(e) => setDrinkName(e.target.value)}
              placeholder="e.g. Hot Cocoa"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Steps:</label>
            {steps.map((step, index) => (
              <div key={index} className="step-input-row">
                <input
                  type="text"
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
                <button 
                  type="button" 
                  className="remove-step"
                  onClick={() => removeStep(index)}
                  disabled={steps.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="add-step" onClick={addStep}>
              + Add Step
            </button>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner /> : "Save Drink"}
            </button>
          </div>
        </form>
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
  const [showAddDrinkForm, setShowAddDrinkForm] = useState(false);
  
  // Fetch drinks from API
  const fetchDrinks = async () => {
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
  };
  
  useEffect(() => {
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
  
  // Handle plus icon click
  const handleAddDrinkClick = () => {
    setShowAddDrinkForm(true);
  };
  
  // Handle closing the add drink form
  const handleCloseAddDrinkForm = () => {
    setShowAddDrinkForm(false);
  };
  
  // Handle drink added successfully
  const handleDrinkAdded = () => {
    // Refresh the drinks list
    fetchDrinks();
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
      
      {showAddDrinkForm && (
        <AddDrinkPopup
          onClose={handleCloseAddDrinkForm}
          onDrinkAdded={handleDrinkAdded}
        />
      )}
      
      <div onClick={handleAddDrinkClick}>
        <img src={plusIcon} alt="Add Drink" className="plus-icon" />
      </div>
    </div>
  );
}

export default App;
