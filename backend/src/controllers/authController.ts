import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

export const register = async (req: Request, res: Response) => {
    try {
        const { memberNumber, name, phone, nationalId, dateJoined, password, role } = req.body;

        const existingMember = await prisma.member.findFirst({
            where: {
                OR: [{ phone }, { nationalId }, { memberNumber }],
            },
        });

        if (existingMember) {
            return res.status(400).json({ message: 'Member already exists with this phone, national ID, or member number' });
        }

        const hashedPassword = await hashPassword(password);

        const member = await prisma.member.create({
            data: {
                memberNumber,
                name,
                phone,
                nationalId,
                dateJoined: new Date(dateJoined),
                password: hashedPassword,
                role: role || 'MEMBER',
            },
        });

        const token = generateToken({ id: member.id, role: member.role });

        res.status(201).json({
            message: 'Member registered successfully',
            token,
            member: {
                id: member.id,
                name: member.name,
                role: member.role,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { phone, password } = req.body;

        const member = await prisma.member.findUnique({
            where: { phone },
        });

        if (!member) {
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        const isMatch = await comparePassword(password, member.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        const token = generateToken({ id: member.id, role: member.role });

        res.json({
            message: 'Login successful',
            token,
            member: {
                id: member.id,
                name: member.name,
                role: member.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
