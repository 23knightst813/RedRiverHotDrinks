# Red River Technical Test  
[Brief Here](https://notes.henr.ee/redriver-technical-test-breif-435kdp)

---

## Description

A full-stack application simulating the operation of a hot drinks machine.
- Frontend built with React for simplicity and efficiency
- Backend built with FastAPI providing a RESTful API
- SQLite database for storing drinks and their preparation steps
- Frontend communicates with backend to fetch available drinks and steps, as well as to add new drinks

~~No Idea how people can justify using a UI Library And a CSS Framework~~

---

## To Access The Deployed App

Visit the deployed app [here](https://hot-drink-front-end.vercel.app/)

---

## To Run Locally

### Backend Setup
1. Make sure Python is installed (3.7+ recommended)
2. Navigate to the backend directory: `cd backEnd`
3. Create a virtual environment: `python -m venv venv`
4. Activate the virtual environment:
  - On Windows: `venv\Scripts\activate`
  - On macOS/Linux: `source venv/bin/activate`
5. Install dependencies: `pip install -r requirements.txt`
6. Run the backend server: `fastapi dev main.py`
7. API will be available at `http://localhost:8000`

### Frontend Setup
1. Navigate to the frontend directory: `cd fontEnd`
2. Create a `.env` file with the following content:
    `VITE_BACKEND_URL=http://localhost:8000`
3. Install dependencies: `npm install`
4. Run the app: `npm run dev`
5. Visit `http://localhost:5173` in your browser

---

## API Endpoints

- `GET /drinks` - Get all available drinks with their preparation steps
- `GET /drinks/{drink_name}` - Get steps for a specific drink
- `POST /drinks` - Add a new drink (requires name and steps)

---

## Google LightHouse

![image](https://github.com/user-attachments/assets/e3c5bf62-3759-4368-a63b-728e9b4daa1c)

---
## Future Developments

- **Ingredient Inventory System**  
- **Weather-Based Recommendations** (🤷‍♂️)

---
