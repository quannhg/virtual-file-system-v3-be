import { FastifyInstance, RouteOptions } from 'fastify';

/**
 *
 * @param swaggerTag Tag of route
 * @param routesOptions Route settings include like url, method, schema, handler function ...
 * @returns Route as `fastify` plugin function
 */
export function createRoute(swaggerTag: HandlerTag, routesOptions: RouteOptions[]) {
    return async function (app: FastifyInstance) {
        routesOptions.forEach((options) => {
            app.route({
                ...options,
                schema: {
                    ...options.schema,
                    tags: [swaggerTag]
                },
                /**
                 * True by default. See https://www.fastify.io/docs/latest/Reference/Server/#exposeHeadRoutes
                 * About HEAD http method: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
                 */
                exposeHeadRoute: false
            });
        });
    };
}
