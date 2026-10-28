import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.join(process.cwd(), ".env")
});

const rawAppUrl = process.env.APP_URL;
const isProd = Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");
const resolvedAppUrl =
    isProd && (!rawAppUrl || rawAppUrl.includes("localhost"))
        ? "https://emergency-ambulance-dispatch-system-iota.vercel.app"
        : rawAppUrl || "http://localhost:3000";

export default {
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    app_url: resolvedAppUrl,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN
};
