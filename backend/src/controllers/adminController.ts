import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: "USER" } });

    const donationSum = await prisma.donation.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    });

    res.json({
      totalUsers,
      totalDonations: donationSum._sum.amount || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllRegistrations = async (_req: Request, res: Response) => {
  try {
    const registrations = await prisma.user.findMany({
      where: { role: "USER" },
    });

    res.json({ registrations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllDonations = async (_req: Request, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ donations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
