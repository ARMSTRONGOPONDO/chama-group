import { Request, Response } from 'express';
import prisma from '../prisma.js';

export const getOverview = async (req: Request, res: Response) => {
    try {
        const totalSavings = await prisma.saving.aggregate({ _sum: { amount: true } });
        const activeLoans = await prisma.loan.findMany({ where: { status: 'ACTIVE' } });
        const totalOutstanding = activeLoans.reduce((sum, loan) => sum + Number(loan.totalPayable), 0);

        const interestEarned = await prisma.loan.aggregate({
            where: { status: { in: ['ACTIVE', 'REPAID'] } },
            _sum: { totalInterest: true }
        });

        res.json({
            totalGroupSavings: totalSavings._sum.amount || 0,
            totalOutstandingPrincipal: totalOutstanding,
            totalInterestEarned: interestEarned._sum.totalInterest || 0,
            activeLoansCount: activeLoans.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating overview report' });
    }
};

export const getMemberStatement = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const savings = await prisma.saving.findMany({
            where: { memberId: id },
            orderBy: { dateRecorded: 'desc' }
        });

        const loans = await prisma.loan.findMany({
            where: { memberId: id },
            include: { repayments: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            memberId: id,
            savings,
            loans
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching member statement' });
    }
};
