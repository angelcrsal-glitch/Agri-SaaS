import os
import requests
import random
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

def get_current_weather(lat: float, lon: float):
    """
    Fetches weather data for the given coordinates.
    Returns a dict: {'temp': float, 'humidity': int, 'description': str}
    """
    
    if not OPENWEATHER_API_KEY:
        print("Warning: OPENWEATHER_API_KEY not found. Skipping weather data.")
        return None

    try:
        url = f"{BASE_URL}?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        return {
            "temp": round(data["main"]["temp"], 1),
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"].title()
        }
    except Exception as e:
        print(f"Error fetching weather data: {e}. Skipping weather data.")
        return None

def _get_mock_weather():
    """Returns realistic mock weather data."""
    conditions = ["Clear Sky", "Few Clouds", "Scattered Clouds", "Broken Clouds", "Shower Rain", "Rain", "Thunderstorm"]
    return {
        "temp": round(random.uniform(15.0, 30.0), 1),
        "humidity": random.randint(30, 80),
        "description": random.choice(conditions)
    }
