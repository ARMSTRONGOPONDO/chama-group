import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { Prisma } from '@prisma/client';

const Decimal = Prisma.Decimal;

export const recordSaving = async (req: AuthRequest, res: Response) => {
    try {
        const { memberId, amount, dateRecorded, transactionId } = req.body;
        const recordedById = req.user?.id as string;

        if (!recordedById) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const saving = await prisma.saving.create({
            data: {
                memberId: memberId as string,
                amount: new Decimal(amount),
                dateRecorded: new Date(dateRecorded),
                transactionId,
                recordedById,
            },
        });

        await prisma.auditLog.create({
            data: {
                type: 'SAVING',
                referenceId: saving.id,
                userId: recordedById,
                amount: new Decimal(amount),
                note: `Registered savings for member ${memberId}`,
            },
        });

        res.status(201).json({ message: 'Saving recorded successfully', saving });
    } catch (error) {
        console.error('Saving error:', error);
        res.status(500).json({ message: 'Error recording saving' });
    }
};

export const getMemberSavings = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const savings = await prisma.saving.findMany({
            where: { memberId: id },
            orderBy: { dateRecorded: 'desc' },
        });
        res.json(savings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching savings' });
    }
};

export const getSavingsSummary = async (req: Request, res: Response) => {
    try {
        const groupTotal = await prisma.saving.aggregate({
            _sum: { amount: true },
        });

        res.json({
            totalGroupSavings: groupTotal._sum.amount || 0,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching savings summary' });
    }
};
