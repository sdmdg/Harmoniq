const sampleAlbum = {
    "name": "Different World",
    "albumCover": "DifferentWorld.png",
    "artist": "Alan Walker",
    "type": "Album",
    "releaseYear": "2018",
    "tracks": [
        {
            "id": 1,
            "name": "Alone",
            "path": "Alan Walker - Alone.mp3",
            "duration": "1;30"
        },
        {
            "id": 2,
            "name": "Faded",
            "path": "Alan Walker - Faded.mp3",
            "duration": "1;30"
        },
        {
            "id": 3,
            "name": "Intro",
            "path": "Alan Walker - Intro.mp3",
            "duration": "1;30"
        }
    ]
};

export const getAlbum = async (req, res) => {
    const { album_id } = req.params;
    try {
        res.status(200).json(sampleAlbum);
    } catch (error) {
        console.error("Get Album Error:", error);
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};
