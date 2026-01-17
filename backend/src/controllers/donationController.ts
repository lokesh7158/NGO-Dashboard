import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { DonationStatus } from "../generated/prisma/client";

export const initiateDonation = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { amount } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const donation = await prisma.donation.create({
      data: {
        userId: user.id,
        amount,
        status: DonationStatus.PENDING,
        paymentGateway: "MOCK",
      },
    });

    res.status(201).json({
      message: "Donation initiated",
      donationId: donation.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDonationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { donationId, status, transactionId } = req.body;

    if (!donationId || !status) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    if (!["SUCCESS", "FAILED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status,
        transactionId: transactionId || `TXN_${Date.now()}`,
      },
    });

    res.json({
      message: "Donation status updated",
      donation: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyDonations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const donations = await prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ donations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
