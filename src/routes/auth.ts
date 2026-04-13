import { z } from 'zod'

import { generateToken, hashPassword, verifyPassword } from '../utils/password.ts'

import type { FastifyZodInstance } from '../utils/types.ts'

/**
 * Authentication routes plugin.
 */
const authRoutes = (fastify: FastifyZodInstance): void => {
  fastify.post('/register', {
    schema: {
      body: z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
        email: z.email().optional(),
      }),
    },
    handler: async (request, reply) => {
      const data = request.body
      // Check if username already exists
      const existingUser = await fastify.db.user.findFirst({
        where: { username: data.username },
      })

      if (existingUser) {
        return reply.status(409).send({ error: 'Username already exist' })
      }

      // Check if email already exists
      if (data.email) {
        const existingEmail = await fastify.db.user.findFirst({
          where: { email: data.email },
        })

        if (existingEmail) {
          return reply.status(409).send({ error: 'Email already registered' })
        }
      }

      // Hash the password
      const hashedPassword = await hashPassword(data.password)

      // Create the user
      const newUser = await fastify.db.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          email: data.email ?? null,
        },
      })

      return reply.status(201).send({
        success: true,
        message: 'User registered',
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
      })
    },
  })

  fastify.post('/login', {
    schema: {
      body: z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
    },
    handler: async (request, reply) => {
      const data = request.body
      // Find user by username
      const user = await fastify.db.user.findFirst({
        where: { username: data.username },
      })

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' })
      }

      // Verify password
      const isValid = await verifyPassword(data.password, user.password)
      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid credentials' })
      }

      // Generate token and store session
      const token = generateToken()
      fastify.sessions.set(token, user.id)

      reply.setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })

      return reply.status(200).send({ success: true, token, userId: user.id })
    },
  })

  fastify.post('/changePass', {
    preHandler: [fastify.authenticate],
    schema: {
      body: z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(6),
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

      // Verify old password
      const isValid = await verifyPassword(data.oldPassword, user.password)
      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid old password' })
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(data.newPassword)
      await fastify.db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      return reply.status(200).send({
        success: true,
        message: 'Password changed successfully',
      })
    },
  })
}

export default authRoutes
