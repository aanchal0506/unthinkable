import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Search / get doctors
router.get("/", doctorController.getDoctors);

// Get single doctor
router.get("/:id", doctorController.getDoctor);

// Admin only
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    doctorController.createDoctor
);

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    doctorController.updateDoctor
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    doctorController.deleteDoctor
);

export default router;