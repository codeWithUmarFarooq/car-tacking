import { Router } from "express";
import { login, resendOtp, signup, verifyOtp } from "../../controller/auth/auth.controller/index.js";
import multerData from "../../utils/multer.js";


const router = Router();
const upload = multerData("user");
router.post("/", upload.none(), signup);
router.post("/login", upload.none(), login);
router.post("/otp", upload.none(), verifyOtp);
router.post("/re-send-otp", upload.none(), resendOtp);


export default router;