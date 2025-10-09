import express from "express";
import { registerUser, loginUser, pwdChangeWithToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/pwd-change", pwdChangeWithToken);

export default router;
