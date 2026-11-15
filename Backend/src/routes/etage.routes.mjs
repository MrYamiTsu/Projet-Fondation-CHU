import { Router } from "express";
import multer from "multer";
import * as etageController from "../controllers/etage.controller.mjs";
import { verifyToken } from "../middlewares/auth.middleware.mjs";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", etageController.getAllEtageByHospital);
router.get("/:id", etageController.getEtageById);
router.post("/", verifyToken, etageController.createEtage);
router.delete("/:id", verifyToken, etageController.deleteEtage);

router.put("/:id/image", verifyToken, upload.single("image"), etageController.addImageToEtage);
router.delete("/:id/image", verifyToken, etageController.deleteImageFromEtage);

export default router;