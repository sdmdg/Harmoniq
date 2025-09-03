import db from '../config/db.js';

export const ModelSetSong = async (
  id,
  albumId,
  title,
  durationSeconds,
  trackNumber,
  bpm,
  valence,
  arousal,
  genre,
  mood
) => {
  const query = `
    INSERT INTO public.songs (
      id,
      album_id,
      title,
      duration,
      track_number,
      bpm,
      valence,
      arousal,
      genre,
      mood
    )
    VALUES ($1, $2, $3, $4::interval, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  // Convert durationSeconds → PostgreSQL interval, or null if unknown
  const durationInterval =
    durationSeconds !== null && durationSeconds !== undefined
      ? `${durationSeconds} seconds`
      : null;

  const values = [
    id,
    albumId,
    title,
    durationInterval,
    trackNumber,
    bpm,
    valence,
    arousal,
    genre,
    mood,
  ];

  const result = await db.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const ModelUpdateSong = async (songId, features, encryptionKey) => {
  // Map the camelCase keys from the features object to SQL snake_case column names.
  // Note: Your initial code already uses snake_case for the database columns.
  const columnMap = {
    duration: 'duration',
    bpm: 'bpm',
    valence: 'valence',
    arousal: 'arousal',
    genre: 'genre',
    mood: 'mood',
  };

  const updates = [];
  const values = [songId]; // Start with the ID for the WHERE clause
  let valueIndex = 2;

  // Build the dynamic SET clause and values array from the features object.
  for (const key in features) {
    if (features.hasOwnProperty(key) && columnMap[key]) {
      const sqlColumn = columnMap[key];
      let value = features[key];

      // Handle the special case for duration, converting seconds to an interval.
      if (key === 'duration') {
        value = (value !== null && value !== undefined)
          ? `${value} seconds`
          : null;
        updates.push(`${sqlColumn} = $${valueIndex}::interval`);
      } else {
        updates.push(`${sqlColumn} = $${valueIndex}`);
      }

      values.push(value);
      valueIndex++;
    }
  }

  if (encryptionKey) {
    updates.push(`encryption_key = $${valueIndex}`);
    values.push(encryptionKey);
    valueIndex++;
  }

  // If no fields to update, return the existing song without a query.
  if (updates.length === 0) {
    return await ModelGetSongById(songId);
  }

  // Construct the full UPDATE query.
  const query = `
    UPDATE public.songs
    SET
      ${updates.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;

  const result = await db.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const ModelGetSongById = async (songId) => {
  const query = `
    SELECT
      id,
      album_id AS "albumId",
      title,
      EXTRACT(EPOCH FROM duration) AS "durationSeconds",
      track_number AS "trackNumber",
      bpm,
      valence,
      arousal,
      genre,
      mood
    FROM public.songs
    WHERE id = $1;
  `;
  const values = [songId];

  const result = await db.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
};