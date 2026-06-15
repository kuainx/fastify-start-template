import fp from 'fastify-plugin'
// import pino from 'pino'
// import { pinoLoki } from 'pino-loki'

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

const isProduction = process.env.NODE_ENV === 'production'

// export function createLogger(): pino.Logger {
//   const streams: pino.StreamEntry[] = [{ stream: process.stdout }]

//   if (process.env.LOKI_URL) {
//     streams.push({
//       level: isProduction ? 'info' : 'debug',
//       stream: pinoLoki({
//         host: process.env.LOKI_URL,
//         endpoint: 'insert/loki/api/v1/push?_msg_field=msg&_time_field=time',
//         labels: { app: 'motionlab-api', env: isProduction ? 'production' : 'development' },
//         batching: { interval: 5, maxBufferSize: 10 },
//       }),
//     })
//   }

//   return pino({ level: isProduction ? 'info' : 'debug' }, pino.multistream(streams))
// }

// export const log = createLogger()

export function enrichRequestLog(request: FastifyRequest): void {
  if (request.userId !== null) {
    request.log = request.log.child({ userId: request.userId })
  }
}

export interface DebugRequestLoggerOptions {
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  customLogMessage?: (
    request: FastifyRequest,
    reply: FastifyReply,
    isRequest: boolean,
  ) => Record<string, any>
}

// 默认日志数据接口
interface DefaultLogData {
  msg: string
  reqId: string | number
  method: string
  url: string
  remoteAddress?: string
  userAgent?: string
  statusCode?: number
  responseTime?: number
  [key: string]: any
}

function getDefaultLogData(
  request: FastifyRequest,
  reply: FastifyReply,
  isRequest: boolean,
): DefaultLogData {
  const base: DefaultLogData = {
    msg: isRequest
      ? `${request.method} ${request.url} incoming request`
      : `${request.method} ${request.url} completed`,
    reqId: request.id,
    method: request.method,
    url: request.url,
    remoteAddress: request.ip,
    userAgent: request.headers['user-agent'],
  }

  if (!isRequest) {
    base.statusCode = reply.statusCode
    base.msg += ` with code ${reply.statusCode}`
    base.responseTime = reply.elapsedTime
  }

  return base
}

function debugRequestLogger(fastify: FastifyInstance, options: DebugRequestLoggerOptions): void {
  const { level = 'debug', customLogMessage = null } = options

  if (!fastify.initialConfig.disableRequestLogging) {
    fastify.log.warn(
      'It is recommended to set `disableRequestLogging: true` when using fastify-debug-request-logger plugin to avoid duplicate logs.',
    )
  }

  // onRequest 钩子
  // fastify.addHook('onRequest', (request, reply, done) => {
  //   let logData: Record<string, any>

  //   if (customLogMessage) {
  //     const custom = customLogMessage(request, reply, true)
  //     logData = custom
  //       ? { ...getDefaultLogData(request, reply, true), ...custom }
  //       : getDefaultLogData(request, reply, true)
  //   } else {
  //     logData = getDefaultLogData(request, reply, true)
  //   }

  //   request.log[level](logData)
  //   done()
  // })

  // onResponse 钩子
  fastify.addHook('onResponse', (request, reply, done) => {
    let logData: Record<string, any>

    if (customLogMessage) {
      const custom = customLogMessage(request, reply, false)
      logData = custom
        ? { ...getDefaultLogData(request, reply, false), ...custom }
        : getDefaultLogData(request, reply, false)
    } else {
      logData = getDefaultLogData(request, reply, false)
    }
    request.log[level](logData)
    done()
  })
}

export const debugRequestLoggerPlugin = fp(debugRequestLogger)
