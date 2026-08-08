import { Router } from "express";

import { env } from "../../config/env.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import courseRoutes from "./course.routes.js";

const router = Router();

// Mount microservice route modules on their configured env prefixes
router.use(env.AUTH_ROUTE_PREFIX, authRoutes);
router.use(env.USER_ROUTE_PREFIX, userRoutes);
router.use(env.COURSE_ROUTE_PREFIX, courseRoutes);

export default router;
