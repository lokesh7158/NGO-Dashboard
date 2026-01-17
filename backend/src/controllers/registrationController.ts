import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getMyRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const registration = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!registration) {
      return res.status(404).json({ message: "No registration found" });
    }

    res.json({ registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
