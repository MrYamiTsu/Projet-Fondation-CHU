import { Router } from "express";
import * as etageController from "../controllers/etage.controller.mjs";
import { verifyToken } from "../middlewares/auth.middleware.mjs";

const router = Router();

router.get("/", etageController.getAllEtageByHospital);
router.get("/:id", etageController.getEtageById);
router.post("/", verifyToken, etageController.createEtage);
router.delete("/:id", verifyToken, etageController.deleteEtage);

router.put("/:id/image", verifyToken, etageController.addImageToEtage);
router.delete("/:id/image", verifyToken, etageController.deleteImageFromEtage);

export default router;