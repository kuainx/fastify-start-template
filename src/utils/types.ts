import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

export type FastifyZodInstance =
  FastifyInstance extends FastifyInstance<
    infer RawServer,
    infer RawRequest,
    infer RawReply,
    infer Logger,
    infer _
  >
    ? FastifyInstance<RawServer, RawRequest, RawReply, Logger, ZodTypeProvider>
    : never
