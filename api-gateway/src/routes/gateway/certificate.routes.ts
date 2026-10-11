import { Router } from "express";

import { certificateProxy } from "../../proxy/proxy.js";

const router = Router();

router.use("/", certificateProxy);

export default router;
