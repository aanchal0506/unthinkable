-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMATION_PATIENT', 'BOOKING_CONFIRMATION_DOCTOR', 'APPOINTMENT_CANCELLATION', 'APPOINTMENT_REMINDER', 'LEAVE_CONFLICT', 'MEDICATION_REMINDER');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledBy" "Role",
ADD COLUMN     "googleDoctorEventId" TEXT,
ADD COLUMN     "googlePatientEventId" TEXT,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "aiError" TEXT,
ADD COLUMN     "aiStatus" "AIStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "patientSummary" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleCalendarLinked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SlotHold" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlotHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "appointmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SlotHold_expiresAt_idx" ON "SlotHold"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SlotHold_doctorId_date_startTime_key" ON "SlotHold"("doctorId", "date", "startTime");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- CreateIndex
CREATE INDEX "NotificationLog_appointmentId_idx" ON "NotificationLog"("appointmentId");
