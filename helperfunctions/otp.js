export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const otpExpiry = (time) => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + time); // 5 minutes expiry
    return expiry;
};