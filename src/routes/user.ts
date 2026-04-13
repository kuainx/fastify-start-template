import { z } from 'zod'

import type { FastifyZodInstance } from '../utils/types.ts'

const userRoutes = (fastify: FastifyZodInstance): void => {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/getInfo', async (request, reply) => {
    const userId = request.userId!
    // Find user by ID
    const user = await fastify.db.user.findFirst({
      where: { id: userId },
    })

    if (!user) {
      return reply.status(404).send({ error: 'User not found' })
    }

    return reply.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email ?? null,
    })
  })

  fastify.post('/updateInfo', {
    schema: {
      body: z.object({
        email: z.email().optional(),
      }),
    },
    handler: async (request, reply) => {
      const data = request.body
      const userId = request.userId!

      // Find user by ID
      const user = await fastify.db.user.findFirst({
        where: { id: userId },
      })

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      // Update email if provided
      const updatedUser = await fastify.db.user.update({
        where: { id: userId },
        data: { email: data.email },
      })

      return reply.status(200).send({
        success: true,
        message: 'User info updated',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email ?? null,
        },
      })
    },
  })
}

export default userRoutes
