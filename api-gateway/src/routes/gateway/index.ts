import { Router } from "express";

import { env } from "../../config/env.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import courseRoutes from "./course.routes.js";
import notificationRoutes from "./notification.routes.js";
import enrollmentRoutes from "./enrollment.routes.js";
import paymentRoutes from "./payment.routes.js";
import progressRoutes from "./progress.routes.js";
import assessmentRoutes from "./assessment.routes.js";
import certificateRoutes from "./certificate.routes.js";

const router = Router();

router.use(env.AUTH_ROUTE_PREFIX, authRoutes);
router.use(env.USER_ROUTE_PREFIX, userRoutes);
router.use(env.COURSE_ROUTE_PREFIX, courseRoutes);
router.use(env.NOTIFICATION_ROUTE_PREFIX, notificationRoutes);
router.use(env.ENROLLMENT_ROUTE_PREFIX, enrollmentRoutes);
router.use(env.PAYMENT_ROUTE_PREFIX, paymentRoutes);
router.use(env.PROGRESS_ROUTE_PREFIX, progressRoutes);
router.use(env.ASSESSMENT_ROUTE_PREFIX, assessmentRoutes);
router.use(env.CERTIFICATE_ROUTE_PREFIX, certificateRoutes);

export default router;
