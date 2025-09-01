from fastapi import FastAPI
import uvicorn
from genre.genre_ai import predict_genre
from mood.mood_ai import predict_mood
from bpm.bpm import detect_bpm
import json

app = FastAPI()

@app.get("/predict")
async def predict(filename: str):
    genre_results = predict_genre(filename)
    mood_results, avg_valence_predicted, avg_arousal_predicted = predict_mood(filename)
    bpm = detect_bpm(filename)

    return {
        "genre": json.loads(json.dumps(genre_results)),
        "mood": mood_results,
        "bpm": round(bpm),
        "valence":round(avg_valence_predicted, 2),
        "arousal":round(avg_arousal_predicted, 2)
    }


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
