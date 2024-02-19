import 'dotenv/config'
import db from './db/conn.mjs'

async function clean() {
  await db.collection('devices').deleteMany({});
  console.log('done')
}

clean()