import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt';
import moment from 'moment';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function generateData() {
    const hashPassword = hashSync('holistics.io', SALT_ROUNDS);
    await prisma.user.create({
        data: {
            email: 'quan.nguyenhg12@gmail.com',
            password: hashPassword,
            username: 'nhgquan',
            firstName: 'Quan',
            lastName: 'Nguyen',
            githubUsername: 'nhgquan',
            phone: '0373395726',
            gender: 'MALE',
            joinedAt: moment().unix()
        }
    });

    const currentTime = moment().unix();

    await prisma.user.create({
        data: {
            email: 'engineer@gmail.com',
            password: hashPassword,
            username: 'engineer',
            firstName: 'John',
            lastName: 'Doe',
            phone: '0373395726',
            joinedAt: currentTime
        }
    });

    process.exit(0);
}
generateData();
