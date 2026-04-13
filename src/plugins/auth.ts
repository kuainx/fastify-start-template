import fp from 'fastify-plugin'

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => void
    sessions: Map<string, number>
  }
  interface FastifyRequest {
    userId: number | null
  }
}

/**
 * Authentication plugin that manages session tokens and request authentication.
 */
const authPlugin = (fastify: FastifyInstance) => {
  // token -> userId
  const sessions = new Map<string, number>()
  fastify.decorate('sessions', sessions)

  /**
   * Authentication middleware that validates the session token from cookies.
   */
  fastify.decorate('authenticate', (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies?.token
    if (!token || !sessions.has(token)) {
      reply.status(401).send({ error: 'Unauthorized' })
      return
    }

    // Add userId to request for further use
    request.userId = sessions.get(token)!
  })
}

export default fp(authPlugin)
