import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }

  healthCheck() {
    return {
      statusCode: 200,
      message: 'Service is Running',
      service: 'nest-2026-monolith',
      version: '1.0.0',
      uptime: process.uptime(),
      pid: process.pid,
      memoryUsage: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external,
      },
      timestamp: new Date().toISOString(),
    }
  }
}
