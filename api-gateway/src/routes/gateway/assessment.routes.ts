import { Router } from "express";

import { assessmentProxy } from "../../proxy/proxy.js";

const router = Router();

router.use("/", assessmentProxy);

export default router;
