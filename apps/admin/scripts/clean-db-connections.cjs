const mysql = require('mysql2/promise')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

async function cleanConnections() {
  console.log('Connecting to MySQL to check connection status...')
  let connection
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    })

    const [[threadsConnected]] = await connection.execute("SHOW STATUS LIKE 'Threads_connected'")
    const [[maxConn]] = await connection.execute("SHOW VARIABLES LIKE 'max_connections'")
    const [[waitTimeout]] = await connection.execute("SHOW VARIABLES LIKE 'wait_timeout'")

    console.log(`Current Threads_connected: ${threadsConnected?.Value}`)
    console.log(`Current max_connections: ${maxConn?.Value}`)
    console.log(`Current wait_timeout: ${waitTimeout?.Value}`)

    // Get all processes
    const [processes] = await connection.execute('SHOW FULL PROCESSLIST')
    console.log(`Found ${processes.length} active MySQL processes.`)

    const currentId = connection.threadId
    let killedCount = 0

    for (const proc of processes) {
      // Kill sleeping processes except our own
      if (proc.Id !== currentId && proc.Command === 'Sleep') {
        try {
          await connection.execute(`KILL ${proc.Id}`)
          killedCount++
        } catch (err) {
          // Process may have already exited
        }
      }
    }

    console.log(`Successfully killed ${killedCount} stale sleeping connections.`)

    // Increase max_connections and reduce wait_timeout to prevent future leaks from hoarding connections
    try {
      await connection.execute('SET GLOBAL max_connections = 500;')
      await connection.execute('SET GLOBAL wait_timeout = 300;') // 5 minutes
      await connection.execute('SET GLOBAL interactive_timeout = 300;') // 5 minutes
      console.log('Successfully set GLOBAL max_connections = 500, wait_timeout = 300s.')
    } catch (err) {
      console.warn('Could not set global variables (may lack SUPER privileges):', err.message)
    }

    const [[newThreadsConnected]] = await connection.execute("SHOW STATUS LIKE 'Threads_connected'")
    console.log(`Updated Threads_connected: ${newThreadsConnected?.Value}`)

    await connection.end()
    console.log('Done!')
  } catch (error) {
    console.error('Error connecting to MySQL:', error)
    if (connection) await connection.end().catch(() => {})
  }
}

cleanConnections()
