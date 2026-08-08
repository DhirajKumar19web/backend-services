import { Router } from "express";

import { userProxy } from "../../proxy/proxy.js";

const router = Router();

router.use("/", userProxy);

export default router;