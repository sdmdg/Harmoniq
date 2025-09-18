import { searchTracks, searchAlbums, searchArtists } from '../models/Search.js';

export const getSearchResults = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required." });
  }

  try {
    const [tracks, albums, artists] = await Promise.all([
      searchTracks(query),
      searchAlbums(query),
      searchArtists(query),
    ]);

    res.json({
      tracks: tracks.map(t => ({
        id: t.id,
        name: t.name,
        path: t.id,
        duration: t.duration.replace(/:/, ';'), // format like "1;30"
        artist: t.artist,
        albumCover: t.album_cover || 'default_album.png',
        key: t.key,
      })),

      albums: albums.map(a => ({
        id: a.id,
        name: a.name,
        artist: a.artist,
        albumCover: a.album_cover || 'default_album.png',
      })),

      artists: artists.map(a => ({
        id: a.id,
        name: a.name,
        photo: a.photo || 'default_artist.png',
      })),
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
