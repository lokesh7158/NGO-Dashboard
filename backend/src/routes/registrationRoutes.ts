import { Router } from "express";
import { getMyRegistration } from "../controllers/registrationController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me", authMiddleware, getMyRegistration);

export default router;
