import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import routes from "./routes";
import { webhook } from "./controllers/payment.controller";

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Webhook must be parsed as raw buffer before express.json()
app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), webhook);

// Parsers & Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Routes
app.use("/api/v1", routes);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "CallAmbulance — Emergency Ambulance Dispatch System API is Running",
  });
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
