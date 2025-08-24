import asyncio
import random
import os
import httpx
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, Form, Query, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

app = FastAPI()

# --- Configure APIs ---
SERPER_API_KEY = os.environ.get("SERPER_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("Gemini API configured successfully.")
else:
    print("Gemini API key not found in .env file.")

# --- App Data ---
CITY_DATA = {
    "Mumbai": {"lat": 19.0760, "lon": 72.8777, "regions": [
        {"name": "Colaba", "lat": 18.9200, "lon": 72.8300},
        {"name": "Andheri", "lat": 19.1197, "lon": 72.8464},
        {"name": "Bandra", "lat": 19.0544, "lon": 72.8403},
        {"name": "Chembur", "lat": 19.0630, "lon": 72.9010},
        {"name": "Borivali", "lat": 19.2294, "lon": 72.8553}
    ]},
    "Delhi": {"lat": 28.7041, "lon": 77.1025, "regions": [
        {"name": "Connaught Place", "lat": 28.6330, "lon": 77.2193},
        {"name": "Karol Bagh", "lat": 28.6508, "lon": 77.1906},
        {"name": "Nehru Place", "lat": 28.5483, "lon": 77.2529},
        {"name": "Dwarka", "lat": 28.5921, "lon": 77.0460},
        {"name": "Rohini", "lat": 28.7253, "lon": 77.1194}
    ]},
    "Bangalore": {"lat": 12.9716, "lon": 77.5946, "regions": [
        {"name": "Koramangala", "lat": 12.9352, "lon": 77.6245},
        {"name": "Indiranagar", "lat": 12.9784, "lon": 77.6408},
        {"name": "Jayanagar", "lat": 12.9308, "lon": 77.5838},
        {"name": "Whitefield", "lat": 12.9698, "lon": 77.7499},
        {"name": "Malleshwaram", "lat": 13.0068, "lon": 77.5713}
    ]}
}

# Static Medical Resources Data (for prototype)
MEDICAL_RESOURCES = [
    {
        "id": 1,
        "name": "Apollo Hospital",
        "type": "Hospital",
        "address": "Jubilee Hills, Hyderabad",
        "contact": "+91-40-2360 7777",
        "website": "https://www.apollohospitals.com/",
        "beds_available": 15, # Initial value
        "wait_time_minutes": 30 # Initial value
    },
    {
        "id": 2,
        "name": "Max Healthcare",
        "type": "Hospital",
        "address": "Saket, New Delhi",
        "contact": "+91-11-2651 5050",
        "website": "https://www.maxhealthcare.in/",
        "beds_available": 10,
        "wait_time_minutes": 45
    },
    {
        "id": 3,
        "name": "Fortis Hospital",
        "type": "Hospital",
        "address": "Bannerghatta Road, Bangalore",
        "contact": "+91-80-2639 4444",
        "website": "https://www.fortishealthcare.com/",
        "beds_available": 20,
        "wait_time_minutes": 20
    },
    {
        "id": 4,
        "name": "Lilavati Hospital",
        "type": "Hospital",
        "address": "Bandra Reclamation, Mumbai",
        "contact": "+91-22-2675 1000",
        "website": "https://www.lilavatihospital.com/",
        "beds_available": 8,
        "wait_time_minutes": 50
    },
    {
        "id": 5,
        "name": "AIIMS Delhi",
        "type": "Hospital",
        "address": "Ansari Nagar, New Delhi",
        "contact": "+91-11-2658 8500",
        "website": "https://www.aiims.edu/",
        "beds_available": 25,
        "wait_time_minutes": 60
    },
    {
        "id": 6,
        "name": "Manipal Hospital",
        "type": "Hospital",
        "address": "Old Airport Road, Bangalore",
        "contact": "+91-80-2502 4444",
        "website": "https://www.manipalhospitals.com/",
        "beds_available": 12,
        "wait_time_minutes": 35
    },
    {
        "id": 7,
        "name": "MedPlus Pharmacy",
        "type": "Pharmacy",
        "address": "Various locations",
        "contact": "1800-123-4567",
        "website": "https://www.medplusindia.com/",
        "beds_available": "N/A",
        "wait_time_minutes": "N/A"
    },
    {
        "id": 8,
        "name": "Dr. Lal PathLabs",
        "type": "Diagnostic Center",
        "address": "Various locations",
        "contact": "+91-11-3988 5050",
        "website": "https://www.lalpathlabs.com/",
        "beds_available": "N/A",
        "wait_time_minutes": "N/A"
    }
]

# --- Configure CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Functions ---
async def get_real_aqi(city: str):
    if not SERPER_API_KEY:
        print("Serper API key not found. Returning random AQI.")
        return random.randint(50, 250)
    url = f"https://google.serper.dev/search"
    payload = {"q": f"live aqi in {city}"}
    headers = {'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json'}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            if 'answerBox' in data and 'answer' in data['answerBox']:
                answer = data['answerBox']['answer']
                for word in answer.split():
                    if word.isdigit():
                        return int(word)
            print(f"Could not find AQI in Serper answer box for {city}. Falling back to random.")
            return random.randint(50, 250)
    except Exception as e:
        print(f"Error fetching real AQI for {city}: {e}")
        return random.randint(50, 250)

async def get_gemini_recommendations(aqi: int, city: str):
    if not GEMINI_API_KEY:
         return "Error: Gemini API key is not configured on the server."
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"Given a current Air Quality Index (AQI) of {aqi} in {city}, provide 2-3 brief, actionable recommendations for a hospital manager. The tone should be advisory and professional. Categorize them as 'Staffing:' and 'Supplies:'."
    try:
        response = await model.generate_content_async(prompt)
        return response.text if response and response.text else "Received an empty response from the AI."
    except Exception as e:
        return f"Error generating recommendations: {e}"

# --- API Endpoints ---
@app.post("/login")
async def handle_login(email: str = Form(...), password: str = Form(...)):
    return RedirectResponse(url="/dashboard.html", status_code=303)

@app.post("/signup")
async def handle_signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    return RedirectResponse(url="/dashboard.html", status_code=303)

@app.get("/api/recommendations")
async def get_recommendations(city: str = "Mumbai"):
    current_aqi = await get_real_aqi(city)
    recommendations = await get_gemini_recommendations(current_aqi, city)
    return {"recommendations": recommendations, "aqi": current_aqi, "city": city}

@app.get("/api/heatmap_data")
async def get_heatmap_data(city: str = "Mumbai"):
    base_aqi = await get_real_aqi(city)
    city_info = CITY_DATA.get(city, CITY_DATA["Mumbai"]) # Default to Mumbai if city not found
    heatmap_points = []
    for region in city_info["regions"]:
        # Simulate realistic variation
        intensity = base_aqi + random.randint(-15, 15)
        # Add a tiny random offset to the coordinates to make the map look more organic
        lat = region["lat"] + random.uniform(-0.005, 0.005)
        lon = region["lon"] + random.uniform(-0.005, 0.005)
        heatmap_points.append([lat, lon, intensity])
    return {"points": heatmap_points, "center": {"lat": city_info["lat"], "lon": city_info["lon"]}}

@app.websocket("/ws/pollution")
async def websocket_pollution_endpoint(websocket: WebSocket, city: str = Query("Mumbai")):
    await websocket.accept()
    try:
        while True:
            aqi = await get_real_aqi(city)
            await websocket.send_json({"location": f"{city} (Live)", "aqi": aqi})
            await asyncio.sleep(300)
    except Exception as e:
        print(f"WebSocket Error for {city}: {e}")
    finally:
        await websocket.close()

@app.get("/api/resources")
async def get_resources(query: str = ""):
    search_query = query.lower()
    filtered_resources = [
        resource for resource in MEDICAL_RESOURCES
        if search_query in resource["name"].lower() or
           search_query in resource["type"].lower() or
           search_query in resource["address"].lower()
    ]

    # Simulate real-time data for hospitals
    for resource in filtered_resources:
        if resource["type"] == "Hospital":
            # Simulate beds available (e.g., 5 to 30)
            resource["beds_available"] = random.randint(5, 30)
            # Simulate wait time (e.g., 15 to 120 minutes)
            resource["wait_time_minutes"] = random.randint(15, 120)
        elif resource["type"] == "Pharmacy":
            resource["beds_available"] = "N/A"
            resource["wait_time_minutes"] = random.randint(5, 15) # Shorter wait times for pharmacies
        elif resource["type"] == "Diagnostic Center":
            resource["beds_available"] = "N/A"
            resource["wait_time_minutes"] = random.randint(10, 45) # Moderate wait times for diagnostic centers

    return filtered_resources

@app.post("/api/chatbot")
async def chatbot_endpoint(request: Request):
    data = await request.json()
    user_message = data.get("message", "")

    if not GEMINI_API_KEY:
        return {"response": "Error: Gemini API key is not configured on the server."}

    model = genai.GenerativeModel('gemini-1.5-flash')
    try:
        chat_session = model.start_chat(history=[])
        response = await chat_session.send_message_async(user_message)
        return {"response": response.text if response and response.text else "Received an empty response from the AI."}
    except Exception as e:
        print(f"Error communicating with Gemini API: {e}")
        return {"response": f"Error: Could not get a response from the AI. {e}"}

# --- Mount Static Files ---
app.mount("/", StaticFiles(directory="..\\frontend", html=True), name="static")