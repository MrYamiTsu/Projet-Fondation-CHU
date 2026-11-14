import { Router } from "express";
import * as pinController from "../controllers/pin.controller.mjs";
import { verifyToken } from "../middlewares/auth.middleware.mjs";

const router = Router();

router.post("/pins", verifyToken, pinController.createPin);

router.delete("/pins/:id", verifyToken, pinController.deletePin);

export default router;