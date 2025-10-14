import { expect } from "chai";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

const { Client } = pkg;
const client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

describe("Harmoniq Database Full Integrity Tests", () => {
  let userId, artistId, albumId, songId, playlistId;

  before(async () => {
    await client.connect();
    // Clean up before running
    await client.query("DELETE FROM liked_songs");
    await client.query("DELETE FROM playlist_songs");
    await client.query("DELETE FROM playlist");
    await client.query("DELETE FROM song_history");
    await client.query("DELETE FROM song_features");
    await client.query("DELETE FROM songs");
    await client.query("DELETE FROM albums");
    await client.query("DELETE FROM artists");
    await client.query("DELETE FROM users");
  });

  after(async () => {
    await client.end();
  });

  // =================== USERS ===================
  it("should insert a valid user", async () => {
    const res = await client.query(
      "INSERT INTO users (user_name, email, role, password) VALUES ($1, $2, $3, $4) RETURNING id",
      ["tester", "tester@mail.com", "listener", "abc123"]
    );
    userId = res.rows[0].id;
    expect(userId).to.exist;
  });

  it("should prevent duplicate email", async () => {
    try {
      await client.query(
        "INSERT INTO users (user_name, email, role, password) VALUES ($1, $2, $3, $4)",
        ["dup_user", "tester@mail.com", "listener", "pass"]
      );
      throw new Error("Duplicate email inserted");
    } catch (err) {
      expect(err.code).to.equal("23505");
    }
  });

  it("should reject missing required fields", async () => {
    try {
      await client.query("INSERT INTO users (email) VALUES ('test2@mail.com')");
      throw new Error("Constraint not enforced");
    } catch (err) {
      expect(err.code).to.equal("23502");
    }
  });

  // =================== ARTISTS ===================
  it("should create artist linked to existing user", async () => {
    const res = await client.query(
      "INSERT INTO artists (user_id, artist_name, description) VALUES ($1, $2, $3) RETURNING id",
      [userId, "Test Artist", "AI-generated music producer"]
    );
    artistId = res.rows[0].id;
    expect(artistId).to.exist;
  });

  it("should enforce unique user_id per artist", async () => {
    try {
      await client.query(
        "INSERT INTO artists (user_id, artist_name) VALUES ($1, $2)",
        [userId, "Duplicate Artist"]
      );
      throw new Error("Unique constraint failed");
    } catch (err) {
      expect(err.code).to.equal("23505");
    }
  });

  // =================== ALBUMS ===================
  it("should create an album for the artist", async () => {
    const res = await client.query(
      "INSERT INTO albums (title, artist, release_date, published) VALUES ($1, $2, CURRENT_DATE, true) RETURNING id",
      ["My First Album", artistId]
    );
    albumId = res.rows[0].id;
    expect(albumId).to.exist;
  });

  it("should not allow album without artist", async () => {
    try {
      await client.query("INSERT INTO albums (title) VALUES ('Invalid Album')");
      throw new Error("Missing foreign key allowed");
    } catch (err) {
      expect(err.code).to.equal("23502");
    }
  });

  // =================== SONGS ===================
  it("should insert valid song under album", async () => {
    const res = await client.query(
      "INSERT INTO songs (album_id, title, bpm, valence, arousal, genre, mood) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [albumId, "Demo Song", 120, 0.8, 0.5, "Pop", "Happy"]
    );
    songId = res.rows[0].id;
    expect(songId).to.exist;
  });

  it("should reject song with missing title", async () => {
    try {
      await client.query(
        "INSERT INTO songs (album_id, bpm) VALUES ($1, $2)",
        [albumId, 100]
      );
      throw new Error("Missing title inserted");
    } catch (err) {
      expect(err.code).to.equal("23502");
    }
  });

  it("should reject song with invalid foreign key", async () => {
    try {
      await client.query(
        "INSERT INTO songs (album_id, title) VALUES ($1, $2)",
        ["00000000-0000-0000-0000-000000000000", "Broken Song"]
      );
      throw new Error("Invalid FK accepted");
    } catch (err) {
      expect(err.code).to.equal("23503");
    }
  });

  // =================== SONG FEATURES ===================
  it("should insert feature vector for a song", async () => {
    const res = await client.query(
      "INSERT INTO song_features (song_id, vector) VALUES ($1, $2) RETURNING *",
      [songId, [0.1, 0.3, 0.7]]
    );
    expect(res.rowCount).to.equal(1);
  });

  it("should prevent inserting features with null vector", async () => {
    try {
      await client.query("INSERT INTO song_features (song_id) VALUES ($1)", [songId]);
      throw new Error("Vector constraint failed");
    } catch (err) {
      expect(err.code).to.equal("23502");
    }
  });

  // =================== PLAYLISTS ===================
  it("should create a playlist for user", async () => {
    const res = await client.query(
      "INSERT INTO playlist (title, user_id) VALUES ($1, $2) RETURNING id",
      ["My Playlist", userId]
    );
    playlistId = res.rows[0].id;
    expect(playlistId).to.exist;
  });

  it("should link song to playlist", async () => {
    const res = await client.query(
      "INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2) RETURNING *",
      [playlistId, songId]
    );
    expect(res.rowCount).to.equal(1);
  });

  it("should prevent duplicate playlist-song combination", async () => {
    try {
      await client.query(
        "INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2)",
        [playlistId, songId]
      );
      throw new Error("Duplicate allowed");
    } catch (err) {
      expect(err.code).to.equal("23505");
    }
  });

  // =================== LIKED SONGS ===================
  it("should link song to liked_songs", async () => {
    const res = await client.query(
      "INSERT INTO liked_songs (user_id, song_id) VALUES ($1, $2) RETURNING *",
      [userId, songId]
    );
    expect(res.rowCount).to.equal(1);
  });

  it("should reject duplicate liked_songs", async () => {
    try {
      await client.query(
        "INSERT INTO liked_songs (user_id, song_id) VALUES ($1, $2)",
        [userId, songId]
      );
      throw new Error("Duplicate like allowed");
    } catch (err) {
      expect(err.code).to.equal("23505");
    }
  });

  // =================== HISTORY & REPORTS ===================
  it("should record song history", async () => {
    const res = await client.query(
      "INSERT INTO song_history (user_id, song_id, listen_time) VALUES ($1, $2, '00:03:30') RETURNING *",
      [userId, songId]
    );
    expect(res.rowCount).to.equal(1);
  });

  it("should insert report for user", async () => {
    const res = await client.query(
      "INSERT INTO reports (user_id, description, category, issue_type) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, "App crashed during playback", "Bug", "Stability"]
    );
    expect(res.rows[0].status).to.equal("pending");
  });

  // =================== FUNCTIONS ===================
  it("should compute cosine_similarity correctly", async () => {
    const res = await client.query("SELECT cosine_similarity(ARRAY[1,2,3]::REAL[], ARRAY[1,2,3]::REAL[]) AS result");
    expect(res.rows[0].result).to.be.closeTo(1.0, 0.0001);
  });

  it("should execute get_user_liked_songs_features() safely", async () => {
    const res = await client.query("SELECT * FROM get_user_liked_songs_features($1)", [userId]);
    expect(res.command).to.equal("SELECT");
  });

  // =================== CASCADE DELETE ===================
  it("should cascade delete songs when album deleted", async () => {
    await client.query("DELETE FROM albums WHERE id=$1", [albumId]);
    const check = await client.query("SELECT * FROM songs WHERE album_id=$1", [albumId]);
    expect(check.rowCount).to.equal(0);
  });

  it("should cascade delete artist when user deleted", async () => {
    await client.query("DELETE FROM users WHERE id=$1", [userId]);
    const check = await client.query("SELECT * FROM artists WHERE user_id=$1", [userId]);
    expect(check.rowCount).to.equal(0);
  });
});
