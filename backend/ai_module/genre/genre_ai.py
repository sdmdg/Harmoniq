import os
import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
import tensorflow as tf
from keras.models import load_model
from collections import Counter
from PIL import Image
import tempfile

# === Configuration ===
MODEL_PATH = "./backend/ai_module/genre/models/genre_classifier_model_final.keras"
TARGET_SHAPE = (288, 288)
CLASSES = ['blues', 'classical', 'country', 'disco', 'hiphop', 'jazz', 'metal', 'pop', 'reggae', 'rock']


# === 1. Load Trained Model ===
def load_trained_model(model_path):
    try:
        model = load_model(model_path)
        print(f"Model loaded successfully from {model_path}")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        print(f"Please ensure the model path is correct.")
        return None


# === 2. Audio Preprocessing Functions ===
def split_audio(audio_path, chunk_duration=30, overlap_duration=15, sr=22050):
    try:
        y, sr = librosa.load(audio_path, sr=sr)
        print(f"Audio loaded: {len(y) / sr:.2f} seconds at {sr} Hz")

        chunk_len = int(chunk_duration * sr)
        overlap = int(overlap_duration * sr)
        step = chunk_len - overlap

        chunks = [y[i:i + chunk_len] for i in range(0, len(y) - chunk_len + 1, step)]

        # Optionally handle last chunk
        if len(y) > chunk_len:
            last_chunk = y[-chunk_len:]
            if not np.array_equal(last_chunk, chunks[-1]):
                chunks.append(last_chunk)

        print(f"Split into {len(chunks)} chunks of {chunk_duration}s each.")
        return chunks, sr
    except Exception as e:
        print(f"Error processing audio file: {e}")
        return None, None


def chunk_to_melspec_image(chunk, sr=22050, target_shape=(288, 288)):
    try:
        mel = librosa.feature.melspectrogram(y=chunk, sr=sr, n_mels=128, n_fft=2048, hop_length=512)
        mel_db = librosa.power_to_db(mel, ref=np.max)

        # Plot and save spectrogram
        plt.figure(figsize=(3, 3))
        librosa.display.specshow(mel_db, sr=sr, x_axis=None, y_axis=None, cmap='inferno')
        plt.axis('off')

        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
            plt.savefig(tmp_path, bbox_inches='tight', pad_inches=0, dpi=100)
        plt.close()

        # Open, load, and close the image
        with Image.open(tmp_path) as img:
            img_resized = img.resize(target_shape, Image.Resampling.LANCZOS)
            img_array = np.array(img_resized)

        os.remove(tmp_path)  # Only remove after it's fully closed

        # Convert grayscale or RGBA to RGB
        if img_array.ndim == 2:
            img_array = np.stack([img_array] * 3, axis=-1)
        elif img_array.shape[-1] == 4:
            img_array = img_array[:, :, :3]

        return img_array / 255.0

    except Exception as e:
        print(f"Error generating spectrogram image: {e}")
        return None


# === 3. Prediction Function for Each Chunk ===
def predict_genre_chunk(model, chunk, sr, classes):
    image = chunk_to_melspec_image(chunk, sr)
    if image is None:
        return None, None, None

    image = np.expand_dims(image, axis=0)
    pred = model.predict(image, verbose=0)[0]
    class_idx = np.argmax(pred)
    return classes[class_idx], pred[class_idx], pred


# === 4. Main Genre Prediction Function ===
def predict_genre(audio_path, model_path=MODEL_PATH, chunk_duration=30, overlap_duration=15):
    print("=" * 60)
    print("MUSIC GENRE PREDICTION")
    print("=" * 60)

    if not os.path.exists(audio_path):
        print(f"Audio file '{audio_path}' not found.")
        return None

    model = load_trained_model(model_path)
    if model is None:
        return None

    chunks, sr = split_audio(audio_path, chunk_duration, overlap_duration)
    if chunks is None:
        return None

    predictions = []
    confidences = []
    all_probs = []

    print("\nAnalyzing Chunks:")
    for i, chunk in enumerate(chunks):
        genre, confidence, prob = predict_genre_chunk(model, chunk, sr, CLASSES)
        if genre:
            predictions.append(genre)
            confidences.append(confidence)
            all_probs.append(prob)
            print(f"Chunk {i+1:2d}: {genre:>10} ({confidence:.3f})")
        else:
            print(f"Chunk {i+1:2d}: Failed")

    if not predictions:
        print("No valid predictions.")
        return None

    print("-" * 60)

    # === Voting: Majority ===
    vote_counts = Counter(predictions)
    majority_genre, majority_count = vote_counts.most_common(1)[0]

    # === Voting: Confidence Weighted ===
    weighted_scores = np.zeros(len(CLASSES))
    for genre, conf in zip(predictions, confidences):
        idx = CLASSES.index(genre)
        weighted_scores[idx] += conf
    weighted_genre = CLASSES[np.argmax(weighted_scores)]

    # === Voting: Average Probabilities ===
    avg_probs = np.mean(all_probs, axis=0)
    ensemble_genre = CLASSES[np.argmax(avg_probs)]
    ensemble_conf = avg_probs[np.argmax(avg_probs)]

    # === Final Result ===
    print("FINAL PREDICTION")
    print(f"Majority Vote:     {majority_genre} ({majority_count}/{len(predictions)} chunks)")
    print(f"Confidence Weight: {weighted_genre}")
    print(f"Average Ensemble:  {ensemble_genre} (confidence: {ensemble_conf:.3f})")

    print("\nProbability Distribution:")
    for genre, prob in sorted(zip(CLASSES, avg_probs), key=lambda x: x[1], reverse=True):
        bar = "█" * int(prob * 30)
        print(f"{genre:>10}: {bar:<30} {prob:.3f}")

    return {
        "prediction": str(ensemble_genre),
        "confidence": str(round(ensemble_conf, 2)),
    }


"""     return {
        "predicted_genre": ensemble_genre,
        "confidence": ensemble_conf,
        "all_probabilities": dict(zip(CLASSES, avg_probs)),
        "chunk_predictions": predictions,
        "chunk_confidences": confidences,
        "vote_counts": dict(vote_counts)
    } """
