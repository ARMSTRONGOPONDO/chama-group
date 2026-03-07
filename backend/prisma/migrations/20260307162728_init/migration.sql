-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TREASURER', 'MEMBER');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'ACTIVE', 'REPAID', 'DEFAULTED');

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "memberNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "dateJoined" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saving" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dateRecorded" TIMESTAMP(3) NOT NULL,
    "recordedById" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Saving_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "principal" DECIMAL(65,30) NOT NULL,
    "interestRatePct" DECIMAL(65,30) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "installmentsCount" INTEGER NOT NULL,
    "disbursedAt" TIMESTAMP(3),
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "totalInterest" DECIMAL(65,30) NOT NULL,
    "totalPayable" DECIMAL(65,30) NOT NULL,
    "installmentAmount" DECIMAL(65,30) NOT NULL,
    "maxMultiplier" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repayment" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "recordedById" TEXT NOT NULL,
    "remainingBalance" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "loanMultiplier" INTEGER NOT NULL DEFAULT 3,
    "minMonthsSaved" INTEGER NOT NULL DEFAULT 3,
    "lateFeePct" DECIMAL(65,30) NOT NULL DEFAULT 5.00,
    "interestPolicy" TEXT NOT NULL DEFAULT 'SIMPLE',

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberNumber_key" ON "Member"("memberNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_phone_key" ON "Member"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Member_nationalId_key" ON "Member"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "Saving_transactionId_key" ON "Saving"("transactionId");

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
