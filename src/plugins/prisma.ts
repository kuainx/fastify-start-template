import fp from 'fastify-plugin'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

import { PrismaClient } from '../prisma/generated/client.ts'

import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient
  }
}

const prismaPlugin = async (fastify: FastifyInstance) => {
  try {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
    const prisma = new PrismaClient({ adapter })
    fastify.log.info('Prisma plugin init')
    await prisma.$connect()
    fastify.log.info('Prisma plugin connected')

    fastify.decorate('db', prisma)

    fastify.addHook('onClose', async (server) => {
      await server.db.$disconnect()
    })
  } catch (error) {
    fastify.log.error(error, 'Prisma plugin error')
  }
}

export default fp(prismaPlugin, { name: 'prisma' })
