import { Router } from "express";

import AUTHROUTES from "./auth/index.js";

const router = Router();

router.use("/auth", AUTHROUTES);


export default router;