"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consultation_controller_1 = __importDefault(require("../controllers/consultation.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.post("/appointments/:appointmentId/consultation", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("DOCTOR"), consultation_controller_1.default.createConsultation);
router.get("/appointments/:appointmentId/consultation", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("DOCTOR"), consultation_controller_1.default.getConsultation);
router.post("/appointments/:appointmentId/consultation/regenerate-summary", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("DOCTOR"), consultation_controller_1.default.regeneratePatientSummary);
exports.default = router;
