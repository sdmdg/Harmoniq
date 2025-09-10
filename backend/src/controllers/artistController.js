// controllers/artistController.js
import { findArtistById } from "../models/Artist.js";

const hardcodedData = {
  monthlyAudience: "238M",
  topSongs: [
    {
      title: "Faded",
      artist: "Alan Walker",
      plays: "5.3B",
      cover:
        "https://lh3.googleusercontent.com/WbQvmYqxKwEbLPj5zSlYe5vrxipjJAaCxqB1cJxyzljnvIr9i4Ix9fyxK9h9BXq5a3jyvPdvGKI_2vWXnA=w544-h544-l90-rj",
    },
    {
      title: "On My Way",
      artist: "Alan Walker",
      plays: "1.5B",
      cover:
        "https://lh3.googleusercontent.com/WbQvmYqxKwEbLPj5zSlYe5vrxipjJAaCxqB1cJxyzljnvIr9i4Ix9fyxK9h9BXq5a3jyvPdvGKI_2vWXnA=w544-h544-l90-rj",
    },
    {
      title: "All Falls Down",
      artist: "Alan Walker",
      plays: "900M",
      cover:
        "https://lh3.googleusercontent.com/mOxS-HGSPLkUsQIlZZP7drX1x-ewJT5YW8O8FKt5HWR5lZ2b8NAQldscy6n8TV34dQKkND2489goh3zH=w544-h544-l90-rj",
    },
    {
      title: "Alone",
      artist: "Alan Walker",
      plays: "1.2B",
      cover:
        "https://lh3.googleusercontent.com/Y19VtLffjcBZ2gMjaD_aMf2w_G4GX49EnycaJDA0tVzIn4GMKn0-sY6njoodgOquCfvUpyKyOp1jYZch9A=w544-h544-l90-rj",
    },
  ],
};

export const getArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const artistFromDB = await findArtistById(id);

    if (!artistFromDB) {
      return res.status(404).json({ message: "Artist not found." });
    }

    const artist = {
      id: artistFromDB.id,
      name: artistFromDB.artist_name,
      description: artistFromDB.description,
      createdAt: artistFromDB.created_at,
      image:artistFromDB.pic_path,
      user: {
        name: artistFromDB.user_name,
        email: artistFromDB.email,
        role: artistFromDB.role,
        image: artistFromDB.image,
      },
      monthlyAudience: hardcodedData.monthlyAudience,
      topSongs: hardcodedData.topSongs,
    };

    res.status(200).json(artist);
  } catch (error) {
    console.error("Error fetching artist:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
