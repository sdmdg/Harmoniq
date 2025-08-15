const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Public Server (Read-only) ---
// This server will only serve static files (GET requests)
const publicApp = express();
const publicPort = 3000;

// Serve songs and images from the 'public' directory
publicApp.use('/public', express.static(path.join(__dirname, 'public')));

publicApp.listen(publicPort, () => {
    console.log(`Public server running at http://localhost:${publicPort}`);
    console.log(`Songs available at http://localhost:${publicPort}/public/songs`);
    console.log(`Images available at http://localhost:${publicPort}/public/images`);
});

// --- Internal Backend (Read/Write) ---
// This server handles file uploads, deletions, and other admin tasks
const internalApp = express();
const internalPort = 3001;

// Use multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine the upload directory based on file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, path.join(__dirname, 'public/images'));
        } else if (file.mimetype.startsWith('audio/')) {
            cb(null, path.join(__dirname, 'public/songs'));
        } else {
            cb(new Error('Invalid file type'));
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name
    }
});

const upload = multer({ storage: storage });

// Endpoint for uploading a single file
internalApp.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.status(200).send({
        message: 'File uploaded successfully!',
        filename: req.file.filename,
        path: `/public/${req.file.mimetype.startsWith('image/') ? 'images' : 'songs'}/${req.file.filename}`
    });
});

// Endpoint for deleting a file
internalApp.delete('/delete/:type/:filename', (req, res) => {
    const { type, filename } = req.params;
    let filePath;

    if (type === 'song') {
        filePath = path.join(__dirname, 'public/songs', filename);
    } else if (type === 'image') {
        filePath = path.join(__dirname, 'public/images', filename);
    } else {
        return res.status(400).send('Invalid file type specified.');
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting file.');
        }
        res.status(200).send('File deleted successfully.');
    });
});

internalApp.listen(internalPort, () => {
    console.log(`Internal backend running at http://localhost:${internalPort}`);
});