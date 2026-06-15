import fp from 'fastify-plugin'
import {
  isResponseSerializationError,
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
} from 'fastify-type-provider-zod'

import type { FastifyInstance } from 'fastify'

const zodPlugin = (fastify: FastifyInstance) => {
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)
  fastify.setErrorHandler((err, req, reply) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(err)
    }
    if (hasZodFastifySchemaValidationErrors(err)) {
      return reply.code(400).send({
        error: 'Request Validation Error',
        message: "Request doesn't match the schema",
        statusCode: 400,
      })
    }
    if (isResponseSerializationError(err)) {
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: "Response doesn't match the schema",
        statusCode: 500,
      })
    }
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Unknown Error',
      statusCode: 500,
    })
  })
}

export default fp(zodPlugin)
