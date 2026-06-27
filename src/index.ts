import fastifyCookie from '@fastify/cookie'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import * as dotenv from 'dotenv'
import fastify from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

import authPlugin from './plugins/auth.ts'
import prismaPlugin from './plugins/prisma.ts'
import replyPlugin from './plugins/reply.ts'
import zodPlugin from './plugins/zod.ts'
import authRoutes from './routes/auth.ts'
import userRoutes from './routes/user.ts'
import { debugRequestLoggerPlugin } from './plugins/log.ts'

import type { ZodTypeProvider } from 'fastify-type-provider-zod'

dotenv.config()

const server = fastify({
  logger: true,
  disableRequestLogging: true,
  // loggerInstance: log,
  // trustProxy: '172.18.0.0/16',
}).withTypeProvider<ZodTypeProvider>()

const start = async () => {
  try {
    // Register plugins
    await server.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET ?? 'a-very-secret-secret',
    })

    await server.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Fastify-Backend API',
          description: 'Fastify Backend API Documentation',
          version: '1.0.0',
        },
      },
      transform: jsonSchemaTransform,
    })

    await server.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    })

    await server.register(zodPlugin)
    await server.register(replyPlugin)
    await server.register(debugRequestLoggerPlugin)
    await server.register(authPlugin)
    await server.register(prismaPlugin)

    // Register routes
    await server.register(authRoutes, { prefix: '/auth' })
    await server.register(userRoutes, { prefix: '/user' })

    const port = Number.parseInt(process.env.PORT ?? '3000')
    const host = process.env.HOST ?? '0.0.0.0'

    await server.listen({ port, host })
    console.log(`Server listening on http://${host}:${port}`)
    console.log(`Documentation available at http://${host}:${port}/docs`)
  } catch (error) {
    server.log.error(error)
    throw error
  }
}

await start()
