import { Logger as NestLogger } from '@nestjs/common'
import { Logger as DrizzleLoggerInterface } from 'drizzle-orm'
import { format } from 'sql-formatter'
import chalk from 'chalk'

export class DrizzleLogger implements DrizzleLoggerInterface {
  private readonly logger = new NestLogger('Database')

  logQuery(query: string, params: unknown[]): void {
    const formattedQuery = format(query, {
      language: 'postgresql',
      tabWidth: 2,
      keywordCase: 'upper',
    })

    // Highlight Params
    const formattedParams = JSON.stringify(params)

    this.logger.log(
      `\n${chalk.gray('------------------------------------------------------------------')}\n` +
        `${this.highlight(formattedQuery)}\n` +
        `${chalk.gray('Params:')} ${chalk.yellow(formattedParams)}\n` +
        `${chalk.gray('------------------------------------------------------------------')}`,
    )
  }

  private highlight(query: string): string {
    return query
      .replace(/SELECT/g, chalk.cyan('SELECT'))
      .replace(/FROM/g, chalk.cyan('FROM'))
      .replace(/WHERE/g, chalk.cyan('WHERE'))
      .replace(/INSERT/g, chalk.green('INSERT'))
      .replace(/UPDATE/g, chalk.yellow('UPDATE'))
      .replace(/DELETE/g, chalk.red('DELETE'))
      .replace(/INTO/g, chalk.cyan('INTO'))
      .replace(/VALUES/g, chalk.cyan('VALUES'))
      .replace(/SET/g, chalk.cyan('SET'))
      .replace(/AND/g, chalk.magenta('AND'))
      .replace(/OR/g, chalk.magenta('OR'))
      .replace(/LIMIT/g, chalk.magenta('LIMIT'))
      .replace(/OFFSET/g, chalk.magenta('OFFSET'))
      .replace(/JOIN/g, chalk.cyan('JOIN'))
      .replace(/ON/g, chalk.cyan('ON'))
      .replace(/AS/g, chalk.gray('AS'))
  }
}
