import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

type Role = "PATIENT" | "DOCTOR" | "ADMIN";

const authorize = (...allowedRoles: Role[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

export {
  authorize,
};