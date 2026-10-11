import { Router } from "express";

import { progressProxy } from "../../proxy/proxy.js";

const router = Router();

router.use("/", progressProxy);

export default router;
