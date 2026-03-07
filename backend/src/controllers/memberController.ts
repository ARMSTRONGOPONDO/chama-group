import { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { hashPassword } from '../utils/auth.js';

export const createMember = async (req: Request, res: Response) => {
    try {
        const { name, phone, nationalId, dateJoined, memberNumber } = req.body;
        if (!name || !phone || !nationalId) {
            return res.status(400).json({ message: 'Name, phone, and national ID are required.' });
        }

        const orFilters: Prisma.MemberWhereInput[] = [{ phone }, { nationalId }];
        if (memberNumber) orFilters.push({ memberNumber });

        const existing = await prisma.member.findFirst({
            where: {
                OR: orFilters,
            },
        });

        if (existing) {
            return res.status(400).json({ message: 'A member with the provided identifier already exists.' });
        }

        const newMemberNumber = memberNumber || `CHM-${Date.now()}`;
        const hashedPassword = await hashPassword(nationalId || 'Chama@2026');
        const member = await prisma.member.create({
            data: {
                name,
                phone,
                nationalId,
                memberNumber: newMemberNumber,
                dateJoined: dateJoined ? new Date(dateJoined) : new Date(),
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: 'Member created successfully', member });
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ message: 'Error creating member', error });
    }
};

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
        res.status(500).json({ message: 'Error fetching members', error });
    }
};

export const getMember = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const requestingUser = req.user;

        // Security check: Members can only access their own data
        if (requestingUser?.role === 'MEMBER' && requestingUser?.id !== id) {
            return res.status(403).json({ message: 'Permission denied. You can only view your own profile.' });
        }

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
        console.error("Error fetching member:", error);
        res.status(500).json({ message: 'Error fetching member', error });
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
        console.error("Error updating member:", error);
        res.status(500).json({ message: 'Error updating member', error });
    }
};
