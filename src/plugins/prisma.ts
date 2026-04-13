import fp from 'fastify-plugin'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

import { PrismaClient } from '../../prisma/generated/index.js'

import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient
  }
}

const prismaPlugin = async (fastify: FastifyInstance) => {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
  const prisma = new PrismaClient({ adapter })

  await prisma.$connect()

  fastify.decorate('db', prisma)

  fastify.addHook('onClose', async (server) => {
    await server.db.$disconnect()
  })
}

export default fp(prismaPlugin)
