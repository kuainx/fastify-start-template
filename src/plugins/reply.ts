import fp from 'fastify-plugin'

import type { FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyReply {
    success: (data?: unknown, message?: string) => FastifyReply
    created: (data?: unknown, message?: string) => FastifyReply
    error: (code: number, message: string) => FastifyReply
    badRequest: (message?: string) => FastifyReply
    unauthorized: (message?: string) => FastifyReply
    forbidden: (message?: string) => FastifyReply
    notFound: (message?: string) => FastifyReply
    conflict: (message?: string) => FastifyReply
    internalServerError: (message?: string) => FastifyReply
  }
}

interface SuccessResponse<T> {
  code: number
  success: true
  data: T
  message?: string
}

interface ErrorResponse {
  code: number
  success: false
  error: string
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse

const replyPlugin = fp(
  (fastify) => {
    fastify.decorateReply('success', function <T>(this: FastifyReply, data?: T, message?: string) {
      const response: SuccessResponse<T | null> = {
        code: 200,
        success: true,
        data: data ?? null,
      }
      if (message) {
        response.message = message
      }
      return this.code(200).send(response as ApiResponse<T>)
    })

    fastify.decorateReply('created', function <T>(this: FastifyReply, data?: T, message?: string) {
      const response: SuccessResponse<T | null> = {
        code: 201,
        success: true,
        data: data ?? null,
      }
      if (message) {
        response.message = message
      }
      return this.code(201).send(response as ApiResponse<T>)
    })

    fastify.decorateReply('error', function (this: FastifyReply, code: number, message: string) {
      return this.code(code).send({
        code,
        success: false,
        error: message,
      } as ErrorResponse)
    })

    const errorHelper = (code: number, defaultMessage: string) => {
      return function (this: FastifyReply, message?: string) {
        return this.code(code).send({
          code,
          success: false,
          error: message ?? defaultMessage,
        } as ErrorResponse)
      }
    }

    fastify.decorateReply('badRequest', errorHelper(400, 'Bad Request'))
    fastify.decorateReply('unauthorized', errorHelper(401, 'Unauthorized'))
    fastify.decorateReply('forbidden', errorHelper(403, 'Forbidden'))
    fastify.decorateReply('notFound', errorHelper(404, 'Not Found'))
    fastify.decorateReply('conflict', errorHelper(409, 'Conflict'))
    fastify.decorateReply('internalServerError', errorHelper(500, 'Internal Server Error'))
  },
  {
    name: 'reply',
  },
)

export default replyPlugin
