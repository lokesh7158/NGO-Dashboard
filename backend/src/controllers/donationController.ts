import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { DonationStatus } from "../generated/prisma/client";
import {
  createPayHereRequest,
  generatePayHereChecksum,
} from "../utils/payhere";

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
        paymentGateway: "PAYHERE",
      },
    });

    const userDetails = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID || "";
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    const paymentRequest = createPayHereRequest(
      merchantId,
      merchantSecret,
      donation.id.toString(),
      amount,
      userDetails.name.split(" ")[0] || "User",
      userDetails.name.split(" ")[1] || "User",
      userDetails.email,
      userDetails.phone || "+94700000000",
      userDetails.address || "Not provided",
      `${baseUrl}/api/donation/return`,
      `${baseUrl}/api/donation/cancel`,
      `${baseUrl}/api/donation/notify`,
    );

    const checksum = generatePayHereChecksum(paymentRequest, merchantSecret);

    res.status(201).json({
      message: "Donation initiated",
      donationId: donation.id,
      paymentRequest: paymentRequest,
      checksum: checksum,
      payhereUrl: "https://sandbox.payhere.lk/pay/checkout",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDonationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { order_id, payment_id, payhere_amount, status_code, md5sig } =
      req.body;

    if (!order_id || !status_code) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const donationId = parseInt(order_id, 10);
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    let newStatus: DonationStatus;
    if (status_code === "2") {
      newStatus = DonationStatus.SUCCESS;
    } else if (status_code === "-1" || status_code === "-2") {
      newStatus = DonationStatus.FAILED;
    } else {
      newStatus = DonationStatus.PENDING;
    }

    if (md5sig && process.env.PAYHERE_MERCHANT_SECRET) {
      const { verifyPayHereSignature } = await import("../utils/payhere");
      const merchantId = process.env.PAYHERE_MERCHANT_ID || "";
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

      const isValid = verifyPayHereSignature(
        merchantId,
        order_id,
        payhere_amount || donation.amount.toString(),
        "LKR",
        status_code,
        md5sig,
        merchantSecret,
      );

      if (!isValid) {
        console.warn(`Invalid PayHere signature for order ${order_id}`);
      }
    }

    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: newStatus,
        transactionId: payment_id || `TXN_${Date.now()}`,
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

export const paymentReturn = async (req: any, res: Response) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/donation-status?orderId=${order_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const paymentCancel = async (req: any, res: Response) => {
  try {
    const { order_id } = req.query;

    if (order_id) {
      await prisma.donation.update({
        where: { id: parseInt(order_id, 10) },
        data: { status: DonationStatus.FAILED },
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/donation-cancelled`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const paymentNotify = async (req: any, res: Response) => {
  try {
    const { order_id, payment_id, payhere_amount, status_code, md5sig } =
      req.body;

    if (!order_id || !status_code) {
      return res.status(400).send("Invalid payload");
    }

    const donationId = parseInt(order_id, 10);
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      return res.status(404).send("Donation not found");
    }

    // Status code 2 = success
    let newStatus: DonationStatus;
    if (status_code === "2") {
      newStatus = DonationStatus.SUCCESS;
    } else if (status_code === "-1" || status_code === "-2") {
      newStatus = DonationStatus.FAILED;
    } else {
      newStatus = DonationStatus.PENDING;
    }

    try {
      if (md5sig && process.env.PAYHERE_MERCHANT_SECRET) {
        const { verifyPayHereSignature } = await import("../utils/payhere");
        const merchantId = process.env.PAYHERE_MERCHANT_ID || "";
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        const isValid = verifyPayHereSignature(
          merchantId,
          order_id,
          payhere_amount || donation.amount.toString(),
          "LKR",
          status_code,
          md5sig,
          merchantSecret,
        );

        if (!isValid) {
          console.warn(`Invalid PayHere signature for order ${order_id}`);
        }
      }
    } catch (sigErr) {
      console.error("Signature verification error:", sigErr);
    }

    await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: newStatus,
        transactionId: payment_id || `TXN_${Date.now()}`,
      },
    });

    res.send("OK");
  } catch (err) {
    console.error("PayHere Notify error:", err);
    res.status(500).send("ERROR");
  }
};
