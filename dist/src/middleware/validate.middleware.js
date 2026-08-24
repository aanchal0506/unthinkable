"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
// Validates req.body against the given schema, replacing it with the
// parsed (and coerced/trimmed) value on success, or returning a 400 with a
// readable list of issues on failure.
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
