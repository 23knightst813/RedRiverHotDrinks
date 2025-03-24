import { useState, useEffect } from "react";
import "./App.css";
import plusIcon from "./assets/PlusIcon.svg";
import drinks from "./data.json";

function LoadingSpinner() {
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const [frameIndex, setFrameIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % spinnerFrames.length);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  return <span className="loading-spinner">{spinnerFrames[frameIndex]}</span>;
}

function Popup({ title, steps, onClose }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
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
              {completedSteps.includes(index) ? '✔' : 
               currentStep === index ? <LoadingSpinner /> : ''}
            </span>
            <p>{step}</p>
          </div>
        ))}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function App() {
  const [selectedDrink, setSelectedDrink] = useState(null);
  
  const handleDrinkClick = (drinkName) => {
    setSelectedDrink(drinkName);
  };
  
  const handleClosePopup = () => {
    setSelectedDrink(null);
  };
  
  return (
    <div>
      <h1>Hot Drinks Maker 5000</h1>
      <div className="drinks-container">
        {Object.keys(drinks).map((drinkName) => (
          <h3 
            key={drinkName}
            onClick={() => handleDrinkClick(drinkName)}
          >
            {drinkName}
          </h3>
        ))}
      </div>
      
      {selectedDrink && (
        <Popup
          title={selectedDrink}
          steps={drinks[selectedDrink]}
          onClose={handleClosePopup}
        />
      )}
      
      <img src={plusIcon} alt="Plus" className="plus-icon" />
    </div>
  );
}

export default App;