import express from "express";
import {
  getPlotByLieu,
  getPlotById,
  getAllPlots,
  addPlot,
  modifyPlot,
  deletePlot,
} from "../controllers/emplacement.controller.mjs";
import {
  validatePlot,
  validatePlotId,
} from "../middlewares/emplacement.middleware.mjs";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.mjs";

const router = express.Router();

router.get("/", getAllPlots);

router.get("/recherche", getPlotByLieu);

router.get("/:id", validatePlotId, getPlotById);

router.post("/", verifyToken, requireAdmin, validatePlot, addPlot);

router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  validatePlotId,
  validatePlot,
  modifyPlot,
);

router.delete("/:id", verifyToken, requireAdmin, validatePlotId, deletePlot);

export default router;
