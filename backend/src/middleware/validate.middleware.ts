import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

// Validates req.body against the given schema, replacing it with the
// parsed (and coerced/trimmed) value on success, or returning a 400 with a
// readable list of issues on failure.
const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

export { validateBody };
