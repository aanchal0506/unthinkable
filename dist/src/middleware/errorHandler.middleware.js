"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const notFoundHandler = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};
exports.notFoundHandler = notFoundHandler;
// Any error thrown/rejected inside a route handler that wasn't already
// caught by that handler's own try/catch ends up here. Controllers in this
// codebase catch their own errors and map them to meaningful status codes,
// so reaching this middleware indicates something genuinely unexpected —
// hence the generic 500 and the full log server-side only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (res.headersSent) {
        return next(err);
    }
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        message: process.env.NODE_ENV === "production"
            ? "Something went wrong. Please try again."
            : err.message || "Internal server error",
    });
};
exports.errorHandler = errorHandler;
