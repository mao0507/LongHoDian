import { DataSource, DataSourceOptions } from 'typeorm'
import { join } from 'path'

export const dataSourceOptions: DataSourceOptions = {
  type: 'better-sqlite3' as const,
  database: process.env.DATABASE_PATH || join(__dirname, '..', '..', 'database.sqlite'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false, // 生產環境使用 migrations
  logging: process.env.NODE_ENV === 'development',
}

const dataSource = new DataSource(dataSourceOptions)
export default dataSource
