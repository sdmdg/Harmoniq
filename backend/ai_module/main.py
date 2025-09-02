import requests
import tempfile
import os
from fastapi import FastAPI
import uvicorn
from genre.genre_ai import predict_genre
from mood.mood_ai import predict_mood
from bpm.bpm import detect_bpm
import json

app = FastAPI()

@app.get("/predict")
async def predict(file_url: str):
    print("Received file_url:", file_url)

    # 1. Download file to temp storage
    try:
        print("Downloading file from URL...")
        response = requests.get(file_url)
        if response.status_code != 200:
            print("Failed to download file. Status code:", response.status_code)
            return {
                "genre": {"prediction": "Unknown", "confidence": 0},
                "mood": {"prediction": "Unknown", "confidence": 0},
                "bpm": 0,
                "valence": 0,
                "arousal": 0
            }
        print("File downloaded successfully.")
    except Exception as e:
        print("Exception while downloading file:", e)
        return {
            "genre": {"prediction": "Unknown", "confidence": 0},
            "mood": {"prediction": "Unknown", "confidence": 0},
            "bpm": 0,
            "valence": 0,
            "arousal": 0
        }

    # Save to temporary file
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
            tmp_file.write(response.content)
            tmp_path = tmp_file.name
        print("Saved file to temp path:", tmp_path)
    except Exception as e:
        print("Exception while saving temp file:", e)
        return {
            "genre": {"prediction": "Unknown", "confidence": 0},
            "mood": {"prediction": "Unknown", "confidence": 0},
            "bpm": 0,
            "valence": 0,
            "arousal": 0
        }

    # 2. Run AI models safely
    try:
        print("Predicting genre...")
        genre_results = predict_genre(tmp_path)
        if genre_results is None:
            genre_results = {"prediction": "Unknown", "confidence": 0}
        print("Genre results:", genre_results)
    except Exception as e:
        print("Error in predict_genre:", e)
        genre_results = {"prediction": "Unknown", "confidence": 0}

    try:
        print("Predicting mood...")
        mood_data = predict_mood(tmp_path)
        if mood_data is None:
            mood_results, avg_valence_predicted, avg_arousal_predicted = {"prediction": "Unknown", "confidence": 0}, 0, 0
        else:
            mood_results, avg_valence_predicted, avg_arousal_predicted = mood_data
        print("Mood results:", mood_results)
    except Exception as e:
        print("Error in predict_mood:", e)
        mood_results, avg_valence_predicted, avg_arousal_predicted = {"prediction": "Unknown", "confidence": 0}, 0, 0

    try:
        print("Detecting BPM...")
        bpm = detect_bpm(tmp_path) or 0
        print("Detected BPM:", bpm)
    except Exception as e:
        print("Error in detect_bpm:", e)
        bpm = 0

    # 3. Cleanup
    try:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
            print("Temp file removed:", tmp_path)
    except Exception as e:
        print("Error deleting temp file:", e)

    # 4. Return structured response
    result = {
        "genre": json.loads(json.dumps(genre_results)),
        "mood": mood_results,
        "bpm": round(bpm),
        "valence": round(avg_valence_predicted, 2),
        "arousal": round(avg_arousal_predicted, 2),
    }
    print("Returning result:", result)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
