import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import registrationRoutes from "./routes/registrationRoutes";
import donationRoutes from "./routes/donationRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/donation", donationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (_req, res) => {
  res.send("API is running");
});

export default app;
