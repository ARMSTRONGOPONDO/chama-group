import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getOverview = async (req: Request, res: Response) => {
    try {
        const totalSavings = await prisma.saving.aggregate({ _sum: { amount: true } });
        const activeLoans = await prisma.loan.findMany({ where: { status: 'ACTIVE' } });
        const totalOutstanding = activeLoans.reduce((sum, loan) => sum + Number(loan.totalPayable), 0);
        const totalLoans = await prisma.loan.aggregate({ _sum: { principal: true } });
        const totalRepayments = await prisma.repayment.aggregate({ _sum: { amount: true } });
        const totalMembers = await prisma.member.count();

        const interestEarned = await prisma.loan.aggregate({
            where: { status: { in: ['ACTIVE', 'REPAID'] } },
            _sum: { totalInterest: true }
        });

        res.json({
            totalGroupSavings: totalSavings._sum.amount || 0,
            totalOutstandingPrincipal: totalOutstanding,
            totalInterestEarned: interestEarned._sum.totalInterest || 0,
            activeLoansCount: activeLoans.length,
            totalMembers,
            totalLoans: totalLoans._sum.principal || 0,
            loansRepaid: totalRepayments._sum.amount || 0,
            interestEarned: interestEarned._sum.totalInterest || 0,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating overview report', error });
    }
};

export const getMemberStatement = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const requestingUser = req.user;

        // Security check: Members can only access their own data
        if (requestingUser?.role === 'MEMBER' && requestingUser?.id !== id) {
            return res.status(403).json({ message: 'Permission denied. You can only view your own statement.' });
        }

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
        console.error("Error fetching member statement:", error);
        res.status(500).json({ message: 'Error fetching member statement', error });
    }
};

export const getSavingsGrowth = async (req: Request, res: Response) => {
    try {
        const savings = await prisma.saving.findMany({
            orderBy: { dateRecorded: 'asc' },
            select: { amount: true, dateRecorded: true },
        });

        const monthlyTotals: Record<string, number> = {};
        savings.forEach((saving) => {
            const month = saving.dateRecorded.toISOString().substring(0, 7);
            monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(saving.amount);
        });

        const result = Object.entries(monthlyTotals).map(([month, total]) => ({ month, total }));
        res.json(result);
    } catch (error) {
        console.error("Error fetching savings growth:", error);
        res.status(500).json({ message: 'Error fetching savings growth', error });
    }
};

export const getLoansIssued = async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({
            where: { status: { in: ['ACTIVE', 'REPAID'] } },
            orderBy: { disbursedAt: 'asc' },
            select: { principal: true, disbursedAt: true },
        });

        const monthlyTotals: Record<string, number> = {};
        loans.forEach((loan) => {
            if (!loan.disbursedAt) return;
            const month = loan.disbursedAt.toISOString().substring(0, 7);
            monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(loan.principal);
        });

        const result = Object.entries(monthlyTotals).map(([month, amount]) => ({ month, amount }));
        res.json(result);
    } catch (error) {
        console.error("Error fetching loans issued:", error);
        res.status(500).json({ message: 'Error fetching loans issued', error });
    }
};

export const getInterestDistribution = async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({
            select: { status: true, totalInterest: true },
        });

        const distribution: Record<string, number> = {};
        loans.forEach((loan) => {
            const status = loan.status || 'UNKNOWN';
            distribution[status] = (distribution[status] || 0) + Number(loan.totalInterest ?? 0);
        });

        const result = Object.entries(distribution).map(([name, value]) => ({ name, value }));
        res.json(result);
    } catch (error) {
        console.error("Error fetching interest distribution:", error);
        res.status(500).json({ message: 'Error fetching interest distribution', error });
    }
};

export const getMemberBreakdown = async (req: Request, res: Response) => {
    try {
        const members = await prisma.member.findMany({
            select: {
                name: true,
                savings: {
                    select: { amount: true },
                },
            },
        });

        const result = members
            .map((member) => ({
                name: member.name,
                value: member.savings.reduce((sum, saving) => sum + Number(saving.amount), 0),
            }))
            .filter((entry) => entry.value > 0);

        res.json(result);
    } catch (error) {
        console.error("Error fetching member breakdown:", error);
        res.status(500).json({ message: 'Error fetching member breakdown', error });
    }
};
