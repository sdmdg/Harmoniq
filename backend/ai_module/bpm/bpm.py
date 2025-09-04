import librosa

def detect_bpm(audio_file):
    # Load the audio file
    y, sr = librosa.load(audio_file)
    # Run onset envelope (to capture beat strength)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    # Estimate tempo (BPM)
    tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)

    return tempo[0]


def get_duration(audio_file):
    y, sr = librosa.load(audio_file)
    duration = librosa.get_duration(y=y, sr=sr)
    
    # Format into hh:mm:ss for PostgreSQL INTERVAL
    hours = int(duration // 3600)
    minutes = int((duration % 3600) // 60)
    seconds = int(duration % 60)
    
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"