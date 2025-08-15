import { ModelgetProPic, ModelSetProPic } from '../models/User.js';
import { uploadFileToServer } from '../services/fileService.js';


export const getProPic = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const user = await ModelgetProPic(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ pic_path: user.pic_path });
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const setProPic = async (req, res) => {
    const userId = req.user.id;

    try {
        const profilePic = await uploadFileToServer(req.file);
        if (!profilePic) {
            return res.status(500).json({ message: 'Failed to upload file to file server.' });
        }

        const result = await ModelSetProPic(userId, profilePic);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile picture updated', profilePic });
    } catch (err) {
        console.error('Error in setProPic:', err);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
};
