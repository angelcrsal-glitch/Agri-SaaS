from google import genai
import os
import io
from PIL import Image

# Configure with the provided key (In production, use env vars, but using provided key for this task)
# The user provided key: AIzaSyBtGql_WkxSSIr6NrgDHW7zduQFQKB82dQ
# Note: It is safer to use environment variables, but adhering to user instructions for now.
client = genai.Client(api_key="AIzaSyBtGql_WkxSSIr6NrgDHW7zduQFQKB82dQ") 

def get_agri_advice(message: str, context: dict, image_data: bytes = None) -> str:
    try:
        model_id = 'gemini-2.5-flash'
        
        prompt = f"""
        Act as an expert Agronomist AI for the AgriSaaS platform in Mexico.
        
        FIELD CONTEXT:
        - Name: {context.get('name', 'Unknown')}
        - Crop: {context.get('crop', 'Unknown')}
        - Moisture: {context.get('moisture', 'N/A')}%
        - Temp: {context.get('temp', 'N/A')}°C
        - Risk Level: {context.get('risk', 'Unknown')}
        
        USER QUESTION: {message}
        
        INSTRUCTIONS:
        - Analyze the risk level and moisture strictly.
        - If an image is provided, analyze it for pests, disease, or physical damage. Combine visual findings with the field data.
        - If risk > 50, give urgent advice.
        - Keep answers short (under 50 words) and practical.
        - Respond in the language of the user (Spanish/English).
        """
        
        content_parts = [prompt]
        if image_data:
            image = Image.open(io.BytesIO(image_data))
            content_parts.append(image)

        response = client.models.generate_content(
            model=model_id,
            contents=content_parts
        )
        return response.text
    except Exception as e:
        print(f"AI Error: {e}")
        return "System: AI Service temporarily unavailable. Check terminal logs."
