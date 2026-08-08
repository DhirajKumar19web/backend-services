import { Router } from "express";

import { authProxy } from "../../proxy/proxy.js";

const router = Router();

router.use("/", authProxy);

export default router;