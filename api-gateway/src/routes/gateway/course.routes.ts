import { Router } from "express";

import { courseProxy } from "../../proxy/proxy.js";

const router = Router();

router.use("/", courseProxy);

export default router;