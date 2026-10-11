import { Router } from "express";

import { enrollmentProxy } from "../../proxy/proxy.js";

const router = Router();

router.use("/", enrollmentProxy);

export default router;
