import dotenv from "dotenv";
dotenv.config();

const allowedOrigins = [
    process.env.FRONTEND_URL ?? "",
    process.env.BASE_URL ?? "",
    process.env.ADMIN_BASE_URL ?? "",
    process.env.TEST_BASE_URL ?? "",
].filter((origin) => origin.trim() !== "");

const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
};

export default corsOptions;
