import tensorflow as tf
import librosa
import numpy as np
import os
import joblib
from datetime import datetime
import re

# MODEL_DIR = "./mood/models/"
MODEL_DIR = "./backend/ai_module/mood/models/"
#MODEL_PATH = "./backend/ai_module/mood/models/best_cnn_model.keras"
#LABEL_SCALAR_PATH = "./backend/ai_module/mood/models/fitted_label_scaler.pkl"

# --- 1. Load the Trained Model ---
def load_model():
    try:
        directory = MODEL_DIR

        # List all files with .keras or .h5 and the timestamp pattern
        files = [
            f for f in os.listdir(directory)
            if re.match(r"mood_classifier_model_\d{8}_\d{6}\.(keras|h5)$", f)
        ]

        latest_file = None

        if files:
            # Extract datetime from filename
            def get_datetime_from_filename(f):
                match = re.search(r"_(\d{8}_\d{6})\.(keras|h5)$", f)
                if match:
                    return datetime.strptime(match.group(1), "%Y%m%d_%H%M%S")
                return datetime.min

            # Get the latest file based on timestamp in filename
            latest_file = max(files, key=get_datetime_from_filename)
        else:
            print("No matching model files found.")


        if (latest_file):
            model_path = os.path.join(MODEL_DIR, latest_file)
            model = tf.keras.models.load_model(model_path)
            print(f"Model loaded successfully from {latest_file}")
        else:
            exit()
            
            
        model = tf.keras.models.load_model(model_path)
        print(f"Model {model_path} loaded successfully.")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        print(f"Please ensure {model_path} is in the same directory or provide the full path.")
        exit()

# --- 2. Load the Fitted MinMaxScaler ---
def load_scaler():
    try:
        directory = MODEL_DIR

        # List all files with .keras or .h5 and the timestamp pattern
        files = [
            f for f in os.listdir(directory)
            if re.match(r"mood_classifier_model_\d{8}_\d{6}\.(pkl)$", f)
        ]

        latest_file = None

        if files:
            # Extract datetime from filename
            def get_datetime_from_filename(f):
                match = re.search(r"_(\d{8}_\d{6})\.(pkl)$", f)
                if match:
                    return datetime.strptime(match.group(1), "%Y%m%d_%H%M%S")
                return datetime.min

            # Get the latest file based on timestamp in filename
            latest_file = max(files, key=get_datetime_from_filename)
        else:
            print("No matching model files found.")


        if (latest_file):
            pkl_path = os.path.join(MODEL_DIR, latest_file)
            scaler = joblib.load(pkl_path)
            print(f"MinMaxScaler {pkl_path} loaded successfully.")
            return scaler
        else:
            exit()

    except Exception as e:
        print(f"Error loading scaler: {e}")
        print(f"Please ensure {pkl_path} is in the same directory or provide the full path.")
        print("You need to run your training notebook again to save this file if it's missing.")
        exit()

# --- 3. Define Preprocessing Function ---
def preprocess_song(audio_path, sr=44100, segment_length=5, n_mels=128, n_fft=2048, hop_length=512):
    """
    Loads an audio file, converts it to mel-spectrograms, and segments it.
    Args:
        audio_path (str): Path to the audio file.
        sr (int): Sampling rate.
        segment_length (int): Length of each audio segment in seconds.
        n_mels (int): Number of Mel bands to generate.
        n_fft (int): Length of the FFT window.
        hop_length (int): Number of samples between successive frames.
    Returns:
        np.array: An array of mel-spectrogram segments, ready for the CNN model, or None if error.
    """
    try:
        # Load audio (mono)
        y_full, sr = librosa.load(audio_path, sr=sr, mono=True)
    except Exception as e:
        print(f"Error loading audio file {audio_path}: {e}")
        return None

    # Segment audio
    segment_samples = segment_length * sr
    segments = [y_full[i:i + segment_samples] for i in range(0, len(y_full), segment_samples)
                if len(y_full[i:i + segment_samples]) == segment_samples]

    if not segments:
        print(f"No full {segment_length}-second segments found in {audio_path}. Song might be too short.")
        return None

    mel_specs = []
    for segment in segments:
        # Compute Mel-spectrogram
        mel_spec = librosa.feature.melspectrogram(y=segment, sr=sr, n_mels=n_mels, n_fft=n_fft, hop_length=hop_length)
        # Convert to dB scale
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        mel_specs.append(mel_spec_db)

    # Convert to numpy array and add channel dimension for CNN input
    mel_specs_array = np.array(mel_specs)
    mel_specs_array = np.expand_dims(mel_specs_array, axis=-1)

    return mel_specs_array

def categorize_mood(valence, arousal, val_thresh=5.0, aro_thresh=5.0, margin=0.0):
    """
    Improved mood categorization using data-driven thresholds and soft margins.
    """
    if valence >= val_thresh + margin and arousal >= aro_thresh + margin:
        return "Happy / Excited"
    elif valence <= val_thresh - margin and arousal >= aro_thresh + margin:
        return "Angry / Tense"
    elif valence <= val_thresh - margin and arousal <= aro_thresh - margin:
        return "Sad / Calm"
    elif valence >= val_thresh + margin and arousal <= aro_thresh - margin:
        return "Calm / Relaxed"
    else:
        return "Mixed / Uncertain Mood"


def predict_mood(file_name):
    if not os.path.exists(file_name):
        print(f"Error: The file '{file_name}' does not exist.")
        print("Please provide a valid path to your song file.")
        return 
    else:
        print(f"\nProcessing song: {os.path.basename(file_name)}...")
        _song = preprocess_song(file_name)

        if _song is not None:
            print(f"Processed into {_song.shape[0]} segments.")
            print(f"Input shape for model: {_song.shape}")

            # Make Predictions (Normalized) ---
            model = load_model()
            predictions_normalized = model.predict(_song)
            print("\nNormalized Predictions (first 5 segments):")
            print(predictions_normalized[:5])

            # Inverse Transform Predictions to Original Scale (1-9) ---
            scaler = load_scaler()
            predictions_original_scale = scaler.inverse_transform(predictions_normalized)
            print("\nOriginal Scale Predictions (first 5 segments):")
            print(predictions_original_scale[:5])

            # Average Predictions Across All Segments for the Song ---
            avg_valence_predicted = np.mean(predictions_original_scale[:, 0])
            avg_arousal_predicted = np.mean(predictions_original_scale[:, 1])

            print(f"\n--- Final Predicted Emotion for '{os.path.basename(file_name)}' ---")
            print(f"Predicted Valence (1-9 scale): {avg_valence_predicted:.2f}")
            print(f"Predicted Arousal (1-9 scale): {avg_arousal_predicted:.2f}")

            # confidence
            valence_std = np.std(predictions_original_scale[:, 0])
            arousal_std = np.std(predictions_original_scale[:, 1])
            ensemble_conf = 1 - np.mean([valence_std, arousal_std]) / 4.0  # normalize by max expected std
            ensemble_conf = max(0.0, min(1.0, ensemble_conf))  # Clamp between 0 and 1


            results = categorize_mood(avg_valence_predicted, avg_arousal_predicted)
            print(results)
            return {
                "prediction": str(results),
                "confidence": str(round(ensemble_conf, 2)),
            }, float(avg_valence_predicted), float(avg_arousal_predicted)

        else:
            print("Failed to preprocess the song. Prediction aborted.")


