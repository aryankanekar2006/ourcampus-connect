
import os
import base64
from pathlib import Path

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise SystemExit(
        "ERROR: GEMINI_API_KEY missing. Check your .env file."
    )

client = genai.Client(api_key=api_key)

# Use a currently available image-generation model.
MODEL = "gemini-2.5-flash-image"

prompt = """
Create an original premium university technology event poster artwork.
Use a deep navy and electric blue gradient, futuristic 3D technology
visuals, artificial intelligence and coding elements, polished lighting,
professional composition, and clear empty space for event details.
Artwork only: no text, logos, dates, watermarks, or QR codes.
"""

try:
    print(f"Requesting image from {MODEL}...")

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config={
            "response_modalities": ["IMAGE"],
        },
    )

    saved = False

    for candidate in response.candidates or []:
        for part in candidate.content.parts or []:
            if part.inline_data and part.inline_data.data:
                image_data = part.inline_data.data

                output = Path("generated_flyer.png")
                output.write_bytes(image_data)

                print(f"SUCCESS: Image saved to {output.resolve()}")
                saved = True
                break

        if saved:
            break

    if not saved:
        print("No image returned. Check the model response and access.")

except Exception as error:
    print(f"Generation failed: {type(error).__name__}: {error}")
