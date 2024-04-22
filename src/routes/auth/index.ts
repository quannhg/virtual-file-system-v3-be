import { authHandler } from '@handlers';
import { LoginDto, SignupDto } from '@dtos/in';
import { AuthResultDto } from '@dtos/out';
import { createRoute } from '@utils';
import { Type } from '@sinclair/typebox';

export const authRoute = createRoute('Auth', [
    {
        method: 'POST',
        url: '/login',
        schema: {
            body: LoginDto,
            response: {
                200: AuthResultDto
            }
        },
        handler: authHandler.login
    },
    {
        method: 'POST',
        url: '/signup',
        schema: {
            body: SignupDto,
            response: {
                200: AuthResultDto
            }
        },
        handler: authHandler.signup
    },
    {
        method: 'DELETE',
        url: '/logout',
        schema: {
            response: {
                200: Type.Null()
            }
        },
        handler: authHandler.logout
    }
]);
