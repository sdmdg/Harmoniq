import os
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import psycopg2
from sklearn.preprocessing import MinMaxScaler

# ---------------------------
# 1. Load environment & connect
# ---------------------------
dotenv_path = os.path.join(os.path.dirname(__file__), '..', 'src', '.env')
load_dotenv(dotenv_path)

conn = psycopg2.connect(
    dbname=os.getenv("PGDATABASE"),
    user=os.getenv("PGUSER"),
    password=os.getenv("PGPASSWORD"),
    host=os.getenv("PGHOST"),
    port=os.getenv("PGPORT")
)
conn.autocommit = True

def get_db_connection():
    print("✅ Establishing database connection...")
    return conn

# ---------------------------
# 2. Fetch user-related songs
# ---------------------------
user_id = "881e2b4f-dbed-4a58-84ad-87be6473f3f3"

queries = {
    "liked": f"SELECT * FROM get_user_liked_songs_features('{user_id}');",
    "history": f"SELECT * FROM get_user_recent_history_features('{user_id}', 30);",
    "album": f"SELECT * FROM get_user_album_songs_features('{user_id}');"
}

dfs = []
for source, query in queries.items():
    df = pd.read_sql(query, conn)
    if df.empty:
        continue
    df["source"] = source
    dfs.append(df)

if not dfs:
    print("⚠️ No songs found for this user.")
    exit()

all_songs = pd.concat(dfs, ignore_index=True)

# ---------------------------
# 3. Remove duplicate songs
# ---------------------------
all_songs_unique = all_songs.drop_duplicates(subset="song_id", keep="first")
print(f"🎵 Unique songs fetched: {len(all_songs_unique)}")

# ---------------------------
# 4. Encode features (18-dim schema)
# ---------------------------
# Normalize bpm the same way as in SQL
all_songs_unique["bpm"] = all_songs_unique["bpm"] / 200.0  

# Define schema columns
feature_columns = [
    "bpm", "valence", "arousal",
    "genre_blues", "genre_classical", "genre_country",
    "genre_disco", "genre_hiphop", "genre_jazz",
    "genre_metal", "genre_pop", "genre_reggae", "genre_rock",
    "mood_happy_excited", "mood_angry_tense", "mood_sad_calm",
    "mood_calm_relaxed", "mood_mixed_uncertain"
]

# Add genre one-hot
genre_map = ["blues","classical","country","disco","hiphop","jazz","metal","pop","reggae","rock"]
for g in genre_map:
    all_songs_unique[f"genre_{g}"] = (all_songs_unique["genre"] == g).astype(int)

# Add mood one-hot
mood_map = {
    "Happy / Excited": "mood_happy_excited",
    "Angry / Tense": "mood_angry_tense",
    "Sad / Calm": "mood_sad_calm",
    "Calm / Relaxed": "mood_calm_relaxed",
    "Mixed / Uncertain Mood": "mood_mixed_uncertain"
}
for m, col in mood_map.items():
    all_songs_unique[col] = (all_songs_unique["mood"] == m).astype(int)

# Ensure all feature columns exist
for col in feature_columns:
    if col not in all_songs_unique:
        all_songs_unique[col] = 0

# ---------------------------
# 5. Build weighted user vector
# ---------------------------
base_weights = {"liked": 1.0, "history": 0.8, "album": 0.5}
weights = []

for _, row in all_songs_unique.iterrows():
    w = base_weights.get(row["source"], 0.5)

    # Recency factor if from history
    if row["source"] == "history" and "last_played" in all_songs_unique.columns:
        last_played = all_songs_unique.loc[
            all_songs_unique["song_id"] == row["song_id"], "last_played"
        ].values[0]
        if pd.notnull(last_played):
            days_ago = (pd.Timestamp.now() - pd.to_datetime(last_played)).days
            recency_factor = max(0.2, 1 - (days_ago / 30))
            w *= recency_factor

    weights.append(w)

weights = np.array(weights)

X = all_songs_unique[feature_columns].values
user_vector = np.average(X, axis=0, weights=weights)

# Replace NaNs with 0
user_vector = np.nan_to_num(user_vector, nan=0.0)
print("✅ User vector (18 elements):", user_vector)
print("📌 Length:", len(user_vector))

# ---------------------------
# 6. Compare with all songs in song_features table
# ---------------------------
with conn.cursor() as cur:
    # Use psycopg2 param substitution to safely pass array
    query = """
        WITH user_vec AS (
            SELECT %s::REAL[] AS vector
        )
        SELECT sf.song_id, cosine_similarity(uv.vector, sf.vector) AS similarity
        FROM song_features sf, user_vec uv
        ORDER BY similarity DESC
        LIMIT 10;
    """
    cur.execute(query, (list(user_vector),))
    top_songs = cur.fetchall()

print("🎯 Top 10 Recommended Songs:")
for song_id, sim in top_songs:
    print(f"Song ID: {song_id}, Similarity: {sim:.4f}")
