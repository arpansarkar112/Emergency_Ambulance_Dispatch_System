import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import config from "./config";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import routes from "./routes";

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
    cors({
        origin: config.app_url,
        credentials: true
    })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", limiter);

// Parsers & Logging
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1", routes);

app.get("/", (req, res) => {
    res.send("Emergency Ambulance Dispatch System API is Running");
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
