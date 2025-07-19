
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOtp, otpExpiry } from "../../../helperfunctions/otp.js";
import { sendResponse } from "../../../helperfunctions/response.js";
import { TABLE } from "../../../utils/enum/table.js";
import { sendOtpEmail } from "../../../services/mail/registerationEmail.js";
import db from "../../../config/db.js";

const isStrongPassword = (password) => {
    const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^])[A-Za-z\d@$!%*?#&^]{8,}$/;
    return strongPasswordRegex.test(password);
};
const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
};
export const signup = async (req, res) => {
    try {
        const { name, email, phone, password, address, role } = req.body;
        if (!isStrongPassword(password)) {
            return sendResponse(res, 400, "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.", false);
        }
        if (!isValidPhone(phone)) {
            return sendResponse(res, 400, "Invalid phone number format.", false);
        }
        const existingUser = await db("users").where({ email }).first();
        if (existingUser && existingUser.is_verified) {
            return sendResponse(res, 400, "Email already registered.", false);
        }
        if (existingUser && !existingUser.is_verified) {
            await db(TABLE.USERS).where({ email }).del();
        }

        const password_hash = await bcrypt.hash(password, 10);
        const trx = await db.transaction();
        const [user] = await trx("users").insert({
            name,
            email,
            phone,
            address,
            password_hash,
            role,
            is_active: false,
        }).returning("id");

        const token = generateOtp();
        const expires_at = otpExpiry(10); // token valid for 10 minutes

        await trx("tokens").insert({
            user_id: Number(user.id),
            token,
            type: "email_verification",
            expires_at,
        });


        await sendOtpEmail(email, name, token);
        await trx.commit();
        return sendResponse(res, 201, "User data Saved.Verification email sent", true);
    } catch (err) {
        await trx.rollback();
        console.log("Error" + err.message);
        return sendResponse(res, 500, "Internal Serve Error", true);
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return sendResponse(res, 400, "Email and password are required.", false);
    }

    try {
        // Find user by email
        const user = await db(TABLE.USERS).where({ email }).first();

        if (!user) {
            return sendResponse(res, 404, "User not found.", false);
        }

        if (!user.is_verified) {
            return sendResponse(res, 403, "Email is not verified. Please verify your email before logging in.", false);
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return sendResponse(res, 401, "Incorrect password.", false);
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, phone: user.phone },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Remove sensitive info
        const { password_hash, ...safeUser } = user;

        return sendResponse(res, 200, "Login successful.", true, {
            token,
            user: safeUser,
        });

    } catch (err) {
        console.error("Login error:", err.message);
        return sendResponse(res, 500, "Internal Server Error", false);
    }
};


export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return sendResponse(res, 400, "Email and OTP are required.", false);
    }

    let trx;
    try {
        // Start transaction
        trx = await db.transaction();

        // Find the user
        const user = await trx("users").where({ email }).first();

        if (!user) {
            await trx.rollback();
            return sendResponse(res, 404, "User not found.", false);
        }

        if (user.is_verified) {
            await trx.rollback();
            return sendResponse(res, 400, "User is already verified.", false);
        }

        // Find the token
        const tokenRecord = await trx("tokens")
            .where({ user_id: user.id, token: otp, type: "email_verification" })
            .first();

        if (!tokenRecord) {
            await trx.rollback();
            return sendResponse(res, 400, "Invalid or expired OTP.", false);
        }

        // Check if OTP expired
        const now = new Date();
        if (new Date(tokenRecord.expires_at) < now) {
            await trx("tokens").where({ id: tokenRecord.id }).del(); // Optional: cleanup expired token
            await trx.rollback();
            return sendResponse(res, 400, "OTP has expired. Please request a new one.", false);
        }

        // Mark user as verified
        await trx("users")
            .where({ id: user.id })
            .update({ is_verified: true, is_active: true });

        // Delete token
        await trx("tokens")
            .where({ id: tokenRecord.id })
            .del();

        await trx.commit();

        return sendResponse(res, 200, "Email verified successfully.", true);
    } catch (err) {
        if (trx) await trx.rollback();
        console.error("OTP verification error:", err.message);
        return sendResponse(res, 500, "Internal Server Error", false);
    }
};
export const resendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return sendResponse(res, 400, "Email is required.", false);
    }

    let trx;
    try {
        trx = await db.transaction();

        // Find the user
        const user = await trx(TABLE.USERS).where({ email }).first();

        if (!user) {
            await trx.rollback();
            return sendResponse(res, 404, "User not found.", false);
        }

        if (user.is_verified) {
            await trx.rollback();
            return sendResponse(res, 400, "User is already verified.", false);
        }

        // Delete old tokens of this type
        await trx("tokens")
            .where({ user_id: user.id, type: "email_verification" })
            .del();

        // Generate new token
        const token = generateOtp();
        const expires_at = otpExpiry(10); // 10 minutes

        // Save new token
        await trx("tokens").insert({
            user_id: user.id,
            token,
            type: "email_verification",
            expires_at,
        });

        // Send OTP Email
        await sendOtpEmail(user.email, user.name, token);

        await trx.commit();

        return sendResponse(res, 200, "A new OTP has been sent to your email.", true);
    } catch (err) {
        if (trx) await trx.rollback();
        console.error("Resend OTP error:", err.message);
        return sendResponse(res, 500, "Internal Server Error", false);
    }
};

