from fastapi import FastAPI
import uvicorn
from genre.genre_ai import predict_genre
from mood.mood_ai import predict_mood
import json

app = FastAPI()

@app.get("/predict")
async def predict(filename: str):
    genre_results = predict_genre(filename)
    mood_results = predict_mood(filename)

    return {
        "genre": json.loads(json.dumps(genre_results)),
        "mood": mood_results
    }


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
