import fastify from 'fastify'

import type { ZodTypeProvider } from 'fastify-type-provider-zod'

const server = fastify().withTypeProvider<ZodTypeProvider>()
export type FastifyZodInstance = typeof server
