"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const userRepository = __importStar(require("../repositories/user.repository"));
const registerUser = async (name, email, password, role) => {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // PATIENT
    if (role === "PATIENT") {
        const result = await prisma_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                },
            });
            const patientProfile = await tx.patientProfile.create({
                data: {
                    userId: user.id,
                },
            });
            return {
                user,
                patientProfile,
            };
        });
        return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
        };
    }
    // DOCTOR / ADMIN
    const user = await userRepository.createUser({
        name,
        email,
        password: hashedPassword,
        role,
    });
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const passwordMatch = await bcrypt_1.default.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        role: user.role,
    }, secret, {
        expiresIn: "1d",
    });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};
exports.loginUser = loginUser;
