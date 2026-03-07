import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

import { Decimal } from 'decimal.js';

export const applyForLoan = async (req: AuthRequest, res: Response) => {
    try {
        const { principal, interestRatePct, termMonths } = req.body;
        const memberId = req.user?.id as string;

        if (!memberId) return res.status(401).json({ message: 'Unauthorized' });

        const savingsRecords = await prisma.saving.findMany({
            where: { memberId },
            select: { dateRecorded: true },
        });

        const uniqueMonths = new Set(savingsRecords.map(s => s.dateRecorded.toISOString().substring(0, 7)));

        const settings = await prisma.setting.findFirst() || { minMonthsSaved: 3, loanMultiplier: 3 };

        if (uniqueMonths.size < settings.minMonthsSaved) {
            return res.status(400).json({ message: `Insufficient savings history. Minimum ${settings.minMonthsSaved} months required.` });
        }

        const activeLoan = await prisma.loan.findFirst({
            where: { memberId, status: 'ACTIVE' },
        });

        if (activeLoan) {
            return res.status(400).json({ message: 'Member already has an active loan.' });
        }

        const totalSavings = await prisma.saving.aggregate({
            where: { memberId },
            _sum: { amount: true },
        });

        const savingsAmount = totalSavings._sum.amount ? Number(totalSavings._sum.amount) : 0;
        const maxAllowed = savingsAmount * settings.loanMultiplier;

        if (principal > maxAllowed) {
            return res.status(400).json({ message: `Requested amount exceeds limit. Max allowed: KSh ${maxAllowed}` });
        }

        const interest = Number(principal) * (Number(interestRatePct) / 100);
        const totalPayable = Number(principal) + interest;
        const installmentAmount = totalPayable / Number(termMonths);

        const loan = await prisma.loan.create({
            data: {
                memberId,
                principal: new Decimal(principal),
                interestRatePct: new Decimal(interestRatePct),
                termMonths,
                installmentsCount: termMonths,
                status: 'PENDING',
                totalInterest: new Decimal(interest),
                totalPayable: new Decimal(totalPayable),
                installmentAmount: new Decimal(installmentAmount),
                maxMultiplier: settings.loanMultiplier,
            },
        });

        await prisma.auditLog.create({
            data: {
                type: 'LOAN_APPLICATION',
                referenceId: loan.id,
                userId: memberId,
                amount: new Decimal(principal),
                note: `Member ${memberId} applied for a loan of KSh ${principal}`,
            },
        });

        res.status(201).json({ message: 'Loan application submitted', loan });
    } catch (error) {
        console.error('Loan application error:', error);
        res.status(500).json({ message: 'Error processing loan application' });
    }
};

export const approveLoan = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const approverId = req.user?.id;

        if (!approverId) return res.status(401).json({ message: 'Unauthorized' });

        const loan = await prisma.loan.update({
            where: { id },
            data: {
                status: 'ACTIVE',
                disbursedAt: new Date(),
            },
        });

        await prisma.auditLog.create({
            data: {
                type: 'LOAN_APPROVAL',
                referenceId: loan.id,
                userId: approverId,
                amount: loan.principal,
                note: `Loan of KSh ${loan.principal} for member ${loan.memberId} approved by user ${approverId}`,
            },
        });

        res.json({ message: 'Loan approved and disbursed', loan });
    } catch (error) {
        res.status(500).json({ message: 'Error approving loan' });
    }
};

export const recordRepayment = async (req: AuthRequest, res: Response) => {
    try {
        const { loanId, amount, paymentDate } = req.body;
        const recordedById = req.user?.id as string;

        if (!recordedById) return res.status(401).json({ message: 'Unauthorized' });

        const loan = await prisma.loan.findUnique({
            where: { id: loanId as string },
        });

        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        const repayments = await prisma.repayment.aggregate({
            where: { loanId: loanId as string },
            _sum: { amount: true },
        });

        const totalPaid = Number(repayments._sum.amount || 0);
        const remainingBefore = Number(loan.totalPayable) - totalPaid;

        if (amount > remainingBefore) {
            return res.status(400).json({ message: `Repayment exceeds balance. Remaining: KSh ${remainingBefore}` });
        }

        const remainingAfter = remainingBefore - Number(amount);

        const repayment = await prisma.repayment.create({
            data: {
                loanId,
                memberId: loan.memberId,
                amount: new Decimal(amount),
                paymentDate: new Date(paymentDate),
                recordedById,
                remainingBalance: new Decimal(remainingAfter),
            },
        });

        if (remainingAfter <= 0) {
            await prisma.loan.update({
                where: { id: loanId as string },
                data: { status: 'REPAID' },
            });
        }

        await prisma.auditLog.create({
            data: {
                type: 'REPAYMENT',
                referenceId: repayment.id,
                userId: recordedById,
                amount: new Decimal(amount),
                note: `Repayment for loan ${loanId}. Remaining: KSh ${remainingAfter}`,
            },
        });

        res.status(201).json({ message: 'Repayment recorded successfully', repayment });
    } catch (error) {
        console.error('Repayment error:', error);
        res.status(500).json({ message: 'Error recording repayment' });
    }
};

export const getLoans = async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({
            include: {
                member: {
                    select: { name: true, memberNumber: true },
                },
                repayments: true,
            },
        });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loans' });
    }
};
