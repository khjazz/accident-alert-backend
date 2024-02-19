import 'dotenv/config'
import db from './db/conn.mjs'

async function clean() {
  await db.collection('users').deleteMany({});
  console.log('done')
}

clean()