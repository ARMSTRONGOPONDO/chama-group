import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

import { Decimal } from 'decimal.js';

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

export const getMemberSavings = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const requestingUser = req.user;

        // Security check: Members can only access their own data
        if (requestingUser?.role === 'MEMBER' && requestingUser?.id !== id) {
            return res.status(403).json({ message: 'Permission denied. You can only view your own savings.' });
        }

        const savings = await prisma.saving.findMany({
            where: { memberId: id },
            orderBy: { dateRecorded: 'desc' },
        });

        const totalMemberSavings = await prisma.saving.aggregate({
            where: { memberId: id },
            _sum: { amount: true },
        });

        res.json({
            savings,
            total: totalMemberSavings._sum.amount || 0,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching savings' });
    }
};

export const getAllSavings = async (req: AuthRequest, res: Response) => {
    try {
        const savings = await prisma.saving.findMany({
            orderBy: { dateRecorded: 'desc' },
            include: {
                member: {
                    select: { id: true, name: true, memberNumber: true },
                },
                recordedBy: {
                    select: { id: true, name: true },
                },
            },
        });

        res.json(savings);
    } catch (error) {
        console.error('Fetch savings error:', error);
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
