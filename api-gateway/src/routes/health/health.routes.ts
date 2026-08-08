import { Router } from "express";

import {
  getLivenessController,
  getReadinessController,
  getHealthController,
} from "../../controllers/index.js";

const router = Router();

router.get("/health/liveness", getLivenessController);
router.get("/health/readiness", getReadinessController);
router.get("/health", getHealthController);

export default router;
