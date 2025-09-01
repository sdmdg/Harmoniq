import librosa

def detect_bpm(audio_file):
    # Load the audio file
    y, sr = librosa.load(audio_file)
    # Run onset envelope (to capture beat strength)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    # Estimate tempo (BPM)
    tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)

    return tempo[0]