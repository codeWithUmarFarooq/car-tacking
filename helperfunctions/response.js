

export const sendResponse = (
    res,
    statusCode,
    message,
    success,
    data
) => {
    if (res.headersSent) {
        console.error("Headers already sent, not sending another response.");
        return; // Prevent sending another response
    }

    res.status(statusCode).json({
        success: success,
        message,
        data,
    });
};