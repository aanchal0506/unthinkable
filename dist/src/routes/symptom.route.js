"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const symptom_controller_1 = __importDefault(require("../controllers/symptom.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.post("/appointments/:appointmentId/symptoms", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("PATIENT"), symptom_controller_1.default.submitSymptoms);
router.get("/appointments/:appointmentId/symptoms", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("PATIENT"), symptom_controller_1.default.getSymptoms);
// Doctor or patient can manually retry AI pre-visit summary generation if it
// previously failed (LLM timeout/outage).
router.post("/appointments/:appointmentId/symptoms/regenerate-summary", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("PATIENT", "DOCTOR"), symptom_controller_1.default.regenerateSummary);
exports.default = router;
