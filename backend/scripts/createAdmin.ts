import 'dotenv/config';
import prisma from '../src/prisma.js';
import { hashPassword } from '../src/utils/auth.js';

type Config = {
  name: string;
  phone: string;
  nationalId: string;
  password: string;
  memberNumber: string;
};

const args = process.argv.slice(2);
const getArg = (flag: string) => {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
};

const config: Config = {
  name: getArg('--name') ?? process.env.ADMIN_NAME ?? 'Super Admin',
  phone: getArg('--phone') ?? process.env.ADMIN_PHONE ?? '0700000000',
  nationalId: getArg('--national') ?? process.env.ADMIN_NATIONAL_ID ?? '99999999',
  password: getArg('--password') ?? process.env.ADMIN_PASSWORD ?? 'Chama@1234',
  memberNumber: getArg('--member-number') ?? process.env.ADMIN_MEMBER_NUMBER ?? `ADM-${Date.now()}`,
};

const createOrUpdateAdmin = async () => {
  const hashedPassword = await hashPassword(config.password);
  const existing = await prisma.member.findFirst({
    where: {
      OR: [
        { memberNumber: config.memberNumber },
        { phone: config.phone },
        { nationalId: config.nationalId },
      ],
    },
  });

  const payload = {
    memberNumber: config.memberNumber,
    name: config.name,
    phone: config.phone,
    nationalId: config.nationalId,
    dateJoined: new Date(),
    role: 'ADMIN',
    status: 'ACTIVE',
    password: hashedPassword,
  } as const;

  if (existing) {
    await prisma.member.update({ where: { id: existing.id }, data: payload });
    console.log(`Updated existing admin (${existing.id}).`);
  } else {
    const admin = await prisma.member.create({ data: payload });
    console.log(`Created admin user ${admin.id}.`);
  }

  console.log('Login with:', {
    username: config.phone,
    password: config.password,
  });
};

createOrUpdateAdmin()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('Failed to seed admin:', err);
    prisma.$disconnect().finally(() => process.exit(1));
  });
