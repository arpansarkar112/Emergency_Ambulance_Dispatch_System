import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port || 5000;

async function main() {
    try {
        if (!process.env.JWT_ACCESS_SECRET || !process.env.STRIPE_SECRET_KEY) {
            console.warn("⚠️ Warning: Missing crucial environment variables (JWT or Stripe secrets).");
        }

        await prisma.$connect();
        console.log("Connected to the database successfully");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Error", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
