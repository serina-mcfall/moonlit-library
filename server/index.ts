import 'dotenv/config'
import server from './server.ts'
import db from './db/connection.ts'

const PORT = process.env.PORT || 3000

async function start() {
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.log('[startup] Running migrations…')
    await db.migrate.latest()
    // eslint-disable-next-line no-console
    console.log('[startup] Running seeds…')
    await db.seed.run()
    // eslint-disable-next-line no-console
    console.log('[startup] Database ready.')
  }

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log('Listening on port', PORT)
  })
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[startup] Failed to start:', err)
  process.exit(1)
})
