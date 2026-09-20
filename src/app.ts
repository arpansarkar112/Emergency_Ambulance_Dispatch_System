import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";

const app: Application = express();

app.use(
    cors({
        origin: config.app_url,
        credentials: true
    })
);

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Server Running");
});

export default app;
