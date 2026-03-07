import { Request, Response } from 'express';
import prisma from '../prisma.js';

export const getMembers = async (req: Request, res: Response) => {
    try {
        const members = await prisma.member.findMany({
            select: {
                id: true,
                memberNumber: true,
                name: true,
                phone: true,
                nationalId: true,
                dateJoined: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching members' });
    }
};

export const getMember = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const member = await prisma.member.findUnique({
            where: { id },
            select: {
                id: true,
                memberNumber: true,
                name: true,
                phone: true,
                nationalId: true,
                dateJoined: true,
                role: true,
                status: true,
                savings: true,
                loans: true,
            },
        });

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json(member);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching member' });
    }
};

export const updateMember = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, phone, status, role } = req.body;

        const member = await prisma.member.update({
            where: { id },
            data: { name, phone, status, role },
        });

        res.json({ message: 'Member updated successfully', member });
    } catch (error) {
        res.status(500).json({ message: 'Error updating member' });
    }
};
