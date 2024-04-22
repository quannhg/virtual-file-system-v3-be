import { compare, hash } from 'bcrypt';
import { prisma } from '@repositories';
import { cookieOptions, DUPLICATED_EMAIL, LOGIN_FAIL, SALT_ROUNDS, USER_NOT_FOUND } from '@constants';
import jwt from 'jsonwebtoken';
import { envs } from '@configs';
import { LoginDto, SignupDto } from '@dtos/in';
import { AuthResultDto } from '@dtos/out';
import { RawHandler } from '@interfaces';
import moment from 'moment';

const login: RawHandler<AuthResultDto, { Body: LoginDto }> = async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    const isEmail = usernameOrEmail.includes('@');
    let user;
    if (isEmail) {
        user = await prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                username: true,
                password: true
            },
            where: { email: usernameOrEmail }
        });
    } else {
        user = await prisma.user.findUnique({
            select: {
                id: true,
                email: true,
                username: true,
                password: true
            },
            where: { username: usernameOrEmail }
        });
    }

    if (!user) return res.badRequest(USER_NOT_FOUND);

    const correctPassword = await compare(password, user.password);
    if (!correctPassword) return res.badRequest(LOGIN_FAIL);

    const userToken = jwt.sign({ userId: user.id }, envs.JWT_SECRET);
    res.setCookie('token', userToken, cookieOptions);

    return {
        id: user.id,
        email: user.email,
        username: user.username
    };
};

const signup: RawHandler<AuthResultDto, { Body: SignupDto }> = async (req, res) => {
    const { email, username, password, firstName, lastName } = req.body;
    const hashPassword = await hash(password, SALT_ROUNDS);
    try {
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashPassword,
                firstName,
                lastName,
                // TODO: remove this hardcode
                joinedAt: moment().unix()
            },
            select: { id: true, email: true, username: true }
        });

        const userToken = jwt.sign({ userId: user.id }, envs.JWT_SECRET);
        res.setCookie('token', userToken, cookieOptions);

        return {
            id: user.id,
            email: user.email,
            username: user.username
        };
    } catch (err) {
        return res.badRequest(DUPLICATED_EMAIL);
    }
};

const logout: RawHandler = async (_req, res) => {
    res.clearCookie('token');
    return null;
};

export const authHandler = {
    login,
    signup,
    logout
};
