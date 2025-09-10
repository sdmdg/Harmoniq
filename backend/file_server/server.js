const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');

// --- Public Server (Read-only) ---
// This server will only serve static files (GET requests)
const publicApp = express();
const publicPort = 3000;

publicApp.use(cors({
    origin: "*", 
    methods: ["*"],
    allowedHeaders: ["*"]
}));

// Middleware to serve files without extension
publicApp.get('/public/:type/:filename', (req, res, next) => {
    const { type, filename } = req.params;

    let dir;
    if (type === 'images') {
        dir = path.join(__dirname, 'public/images');
    } else if (type === 'songs') {
        dir = path.join(__dirname, 'public/songs');
    } else {
        return res.status(404).send('Invalid type');
    }

    // Possible extensions to check
    const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.mp3', '.wav', '.ogg', ''];

    for (const ext of extensions) {
        const filePath = path.join(dir, filename + ext);
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
    }

    next(); // If not found, pass to static middleware
});

// Serve songs and images from the 'public' directory (fallback for normal requests)
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

internalApp.post('/encrypt/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'public/songs', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send({ error: 'File not found' });
    }

    try {
        // Generate random key
        const key = crypto.randomBytes(32); // AES-256
        const iv = Buffer.from('zgsfeUhuC+rYJiOFMNVD8A==', 'base64');

        // Read file
        const data = fs.readFileSync(filePath);

        // Encrypt
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

        // Write encrypted file
        const encryptedPath = filePath + '.encrypted';
        fs.writeFileSync(encryptedPath, encrypted);

        console.log(`Encrypted ${filename} -> ${path.basename(encryptedPath)}`);

        fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting original file:', err);
        });

        // Respond with key/iv (hex or base64 for DB)
        res.status(200).send({
            message: 'File encrypted successfully',
            original: filename,
            encrypted: path.basename(encryptedPath),
            key_hex: key.toString('hex'),
            iv_hex: iv.toString('hex'),
            key_base64: key.toString('base64'),
            iv_base64: iv.toString('base64')
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error encrypting file' });
    }
});

internalApp.listen(internalPort, () => {
    console.log(`Internal backend running at http://localhost:${internalPort}`);
});