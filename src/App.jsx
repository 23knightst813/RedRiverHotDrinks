import { useState, useEffect } from "react";
import "./App.css";
import plusIcon from "./assets/PlusIcon.svg";
import drinks from "./data.json";

// This component is a loading spinner that cycles through a set of frames providing viusal feedback to the user
function LoadingSpinner() {
  // Define the frames of the spinners, Using Unicode characters to create a spinner effect
  const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  // Use the useState hook to keep track of the current frame index
  const [frameIndex, setFrameIndex] = useState(0);

  // Every 100 milliseconds, update the frame index to the next frame in the spinnerFrames array
  useEffect(() => {
    // Use the setInterval function to update the frame index every 100 milliseconds
    const interval = setInterval(() => {
      // Use the modulo operator to cycle through the spinnerFrames array
      setFrameIndex((prev) => (prev + 1) % spinnerFrames.length);
    }, 100);
    // When the component is no longer needed stop the timer
    return () => clearInterval(interval);
  }, []);
  // Return a span element with the class loading-spinner and the current frame from the spinnerFrames array
  return <span className="loading-spinner">{spinnerFrames[frameIndex]}</span>;
}

// This component is a popup that displays the steps required to make a drink
function Popup({ title, steps, onClose }) {
  // Use the useState hook to keep track of the steps that have been completed and the current step
  const [completedSteps, setCompletedSteps] = useState([]);
  // Initialize the current step to 0
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // If the current step is less than the total number of steps, set a timer to increment the current step and add the current step to the completed steps
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        // Use the spread operator to add the current step to the completed steps array
        setCompletedSteps((prev) => [...prev, currentStep]);
        // Increment the current step by 1 after 1 second
        setCurrentStep((prev) => prev + 1);
      }, 1000);
      // When the component is no longer needed, clear the timer
      return () => clearTimeout(timer);
    }
    // If the current step is equal to the total number of steps, clear the timer
  }, [currentStep, steps.length]);

  // Return a div element with the class popup-overlay that contains the popup content
  return (
    <div className="popup-overlay">
      <div className="popup">
        {/* Display the title of the drink */}
        <h4>{title}</h4>
        {/* Map over the steps array and display each step with an indicator */}
        {steps.map((step, index) => (
          // Use the index as the key for each step
          <div key={index} className="step-row">
            {/* Display the step text and an indicator based on whether the step is completed or the current step */}
            <span className="step-indicator">
              {/* If the step is completed, display a checkmark, if the step is the current step, display a loading spinner */}
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
        {/* Display a button to close the popup */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// This is the main App component that displays a list of drinks and handles the selection of a drink
function App() {
  // Stores the name of the selected drink
  const [selectedDrink, setSelectedDrink] = useState(null);

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
      <div className="drinks-container">
        {/* Map over the drinks object and display each drink name as a clickable element */}
        {Object.keys(drinks).map((drinkName) => (
          <h3
            key={drinkName}
            // When a drink is clicked, call the handleDrinkClick function with the drink name
            onClick={() => handleDrinkClick(drinkName)}
          >
            {drinkName}
          </h3>
        ))}
      </div>
      {/* If a drink is selected, display the popup with the selected drink */}
      {selectedDrink && (
        <Popup
          title={selectedDrink}
          steps={drinks[selectedDrink]}
          onClose={handleClosePopup}
        />
      )}
      {/* Display the plus icon at the bottom of the page, indicating that more drinks can be added */}
      <img src={plusIcon} alt="Plus" className="plus-icon" />
    </div>
  );
}

export default App;
