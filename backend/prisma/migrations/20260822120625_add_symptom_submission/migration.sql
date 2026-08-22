-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AIStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "SymptomSubmission" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "symptoms" TEXT NOT NULL,
    "aiSummary" TEXT,
    "urgency" "UrgencyLevel",
    "chiefComplaint" TEXT,
    "suggestedQuestions" JSONB,
    "aiStatus" "AIStatus" NOT NULL DEFAULT 'PENDING',
    "aiError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SymptomSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SymptomSubmission_appointmentId_key" ON "SymptomSubmission"("appointmentId");

-- CreateIndex
CREATE INDEX "SymptomSubmission_appointmentId_idx" ON "SymptomSubmission"("appointmentId");

-- AddForeignKey
ALTER TABLE "SymptomSubmission" ADD CONSTRAINT "SymptomSubmission_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
