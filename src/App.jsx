import { useState } from 'react'
import './App.css'
import drinks from './data.json'

function Popup({ title, steps, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h4>{title}</h4>
          {steps.map((step, index) => (
            <p key={index}>{step}</p>
          ))}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function App() {
  const [activePopup, setActivePopup] = useState(null)

  return (
    <>
      <h1>Drinks Maker 5000</h1>
      <div className="container">
        {Object.keys(drinks).map((drinkName) => (
          <h3 key={drinkName} onClick={() => setActivePopup(drinkName)}>
            {drinkName}
          </h3>
        ))}
      </div>

      {activePopup && (
        <Popup 
          title={activePopup}
          steps={drinks[activePopup]}
          onClose={() => setActivePopup(null)}
        />
      )}
    </>
  )
}

export default App