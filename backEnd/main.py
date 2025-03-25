from typing import Union, Dict, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "https://hot-drink-front-end.vercel.app"],  # Allow localhost and production frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the database
def init_db():
    conn = sqlite3.connect('drinks.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS drinks (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY,
        drink_id INTEGER,
        step_text TEXT,
        step_order INTEGER,
        FOREIGN KEY (drink_id) REFERENCES drinks (id)
    )
    ''')
    
    # Insert initial data if table is empty
    cursor.execute('SELECT COUNT(*) FROM drinks')
    if cursor.fetchone()[0] == 0:
        # Sample data from the original JSON
        drinks_data = {
            "Lemon Tea": [
                "Boiling water",
                "Steeping the water in the tea",
                "Pouring tea in the cup",
                "Adding lemon"
            ],
            "Coffee": [
                "Boiling water",
                "Adding coffee grounds",
                "Pouring water over grounds",
                "Letting it brew",
                "Pouring coffee in the cup"
            ],
            "Hot Chocolate": [
                "Boiling water",
                "Adding chocolate powder",
                "Pouring water in the cup",
                "Mixing well"
            ]
        }
        
        for drink_name, steps in drinks_data.items():
            cursor.execute('INSERT INTO drinks (name) VALUES (?)', (drink_name,))
            drink_id = cursor.lastrowid
            
            for i, step in enumerate(steps):
                cursor.execute('INSERT INTO steps (drink_id, step_text, step_order) VALUES (?, ?, ?)',
                              (drink_id, step, i))
    
    conn.commit()
    conn.close()

# Initialize the database at startup
init_db()

@app.get("/")
def read_root():
    return {"message": "Hot Drinks API"}

@app.get("/drinks")
def get_all_drinks():
    conn = sqlite3.connect('drinks.db')
    cursor = conn.cursor()
    
    # Get all drinks and their steps
    cursor.execute('''
    SELECT d.name, s.step_text 
    FROM drinks d
    JOIN steps s ON d.id = s.drink_id
    ORDER BY d.name, s.step_order
    ''')
    
    rows = cursor.fetchall()
    conn.close()
    
    # Format as the original JSON structure
    result = {}
    for drink_name, step in rows:
        if drink_name not in result:
            result[drink_name] = []
        result[drink_name].append(step)
    
    return result

@app.get("/drinks/{drink_name}")
def get_drink_steps(drink_name: str):
    conn = sqlite3.connect('drinks.db')
    cursor = conn.cursor()
    
    # Check if drink exists
    cursor.execute('SELECT id FROM drinks WHERE name = ?', (drink_name,))
    drink = cursor.fetchone()
    
    if not drink:
        conn.close()
        raise HTTPException(status_code=404, detail="Drink not found")
    
    # Get steps for the drink
    cursor.execute('''
    SELECT step_text FROM steps
    WHERE drink_id = ?
    ORDER BY step_order
    ''', (drink[0],))
    
    steps = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    return steps

@app.post("/drinks", status_code=201)
async def add_drink(request: Request):
    # Get JSON data directly from request
    data = await request.json()
    
    # Validate request data
    if not isinstance(data, dict) or "name" not in data or "steps" not in data:
        raise HTTPException(status_code=400, detail="Invalid request format. Must include 'name' and 'steps'")
    
    drink_name = data.get("name")
    steps = data.get("steps")
    
    if not isinstance(drink_name, str) or not isinstance(steps, list):
        raise HTTPException(status_code=400, detail="Invalid data types: name must be string, steps must be list")
    
    conn = sqlite3.connect('drinks.db')
    cursor = conn.cursor()
    
    try:
        # Add drink
        cursor.execute('INSERT INTO drinks (name) VALUES (?)', (drink_name,))
        drink_id = cursor.lastrowid
        
        # Add steps
        for i, step in enumerate(steps):
            cursor.execute('INSERT INTO steps (drink_id, step_text, step_order) VALUES (?, ?, ?)',
                          (drink_id, step, i))
        
        conn.commit()
        conn.close()
        return {"message": "Drink added successfully"}
    
    except sqlite3.IntegrityError:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=400, detail="Drink already exists")
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))