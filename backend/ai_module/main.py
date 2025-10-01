import requests
import tempfile
import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
from genre.genre_ai import predict_genre
from mood.mood_ai import predict_mood
from bpm.bpm import detect_bpm, get_duration
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

    duration = get_duration(tmp_path)

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
        "duration": duration
    }
    print("Returning result:", result)
    return result

@app.post("/upload-mood-model")
async def upload_mood_model(model_file: UploadFile = File(...)):
    """Upload and save the mood classification model"""
    try:
        print(f"Uploading mood model: {model_file.filename}")
        
        # Validate file type
        allowed_extensions = ['.pkl', '.h5', '.pt', '.pth', '.onnx', '.tflite']
        file_extension = os.path.splitext(model_file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Create models directory if it doesn't exist
        mood_models_dir = os.path.join("mood", "models")
        os.makedirs(mood_models_dir, exist_ok=True)
        
        # Use original filename - no renaming
        model_path = os.path.join(mood_models_dir, model_file.filename)
        
        # Check if file already exists
        if os.path.exists(model_path):
            print(f"Warning: File {model_file.filename} already exists and will be overwritten")
        
        # Save new model with original name
        with open(model_path, "wb") as buffer:
            content = await model_file.read()
            buffer.write(content)
        
        print(f"Mood model saved to: {model_path}")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Mood model uploaded successfully",
                "filename": model_file.filename,
                "path": model_path,
                "size": len(content)
            }
        )
        
    except Exception as e:
        print(f"Error uploading mood model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload mood model: {str(e)}")

@app.post("/upload-genre-model")
async def upload_genre_model(model_file: UploadFile = File(...)):
    """Upload and replace the genre classification model"""
    try:
        print(f"Uploading genre model: {model_file.filename}")
        
        # Validate file type
        allowed_extensions = ['.pkl', '.h5', '.pt', '.pth', '.onnx', '.tflite']
        file_extension = os.path.splitext(model_file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Create models directory if it doesn't exist
        genre_models_dir = os.path.join("genre", "models")
        os.makedirs(genre_models_dir, exist_ok=True)
        
        # Use original filename - no renaming
        model_path = os.path.join(genre_models_dir, model_file.filename)
        
        # Check if file already exists
        if os.path.exists(model_path):
            print(f"Warning: File {model_file.filename} already exists and will be overwritten")
        
        # Save new model with original name
        with open(model_path, "wb") as buffer:
            content = await model_file.read()
            buffer.write(content)
        
        print(f"Genre model saved to: {model_path}")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Genre model uploaded successfully",
                "filename": model_file.filename,
                "path": model_path,
                "size": len(content)
            }
        )
        
    except Exception as e:
        print(f"Error uploading genre model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload genre model: {str(e)}")

@app.get("/model-status")
async def get_model_status():
    """Get the status of current AI models"""
    try:
        mood_models = []
        genre_models = []
        
        # Check mood models
        mood_models_dir = os.path.join("mood", "models")
        if os.path.exists(mood_models_dir):
            for file in os.listdir(mood_models_dir):
                if file.endswith(('.pkl', '.h5', '.pt', '.pth', '.onnx', '.tflite')):
                    file_path = os.path.join(mood_models_dir, file)
                    file_size = os.path.getsize(file_path)
                    mood_models.append({
                        'name': file,
                        'size': file_size,
                        'path': file_path
                    })
        
        # Check genre models
        genre_models_dir = os.path.join("genre", "models")
        if os.path.exists(genre_models_dir):
            for file in os.listdir(genre_models_dir):
                if file.endswith(('.pkl', '.h5', '.pt', '.pth', '.onnx', '.tflite')):
                    file_path = os.path.join(genre_models_dir, file)
                    file_size = os.path.getsize(file_path)
                    genre_models.append({
                        'name': file,
                        'size': file_size,
                        'path': file_path
                    })
        
        return {
            "status": {
                "mood_models": mood_models,
                "genre_models": genre_models,
                "total_mood_models": len(mood_models),
                "total_genre_models": len(genre_models)
            },
            "message": "Model status retrieved successfully"
        }
        
    except Exception as e:
        print(f"Error getting model status: {e}")
        return {
            "status": {
                "mood_models": [],
                "genre_models": [],
                "total_mood_models": 0,
                "total_genre_models": 0
            },
            "message": f"Error retrieving model status: {str(e)}"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
