import Fastify from 'fastify'
import './loadEnvironment.mjs'
import db from './db/conn.mjs'
import UserService from './services/userService.js'

const PORT = process.env.PORT || 5050;

const fastify = Fastify({
  logger: true
})

fastify.post('/register', async function (request, reply) {
  let collection = await db.collection("users");
  const userService = new UserService(collection)

  try {
    const user = await userService.register(request.body);
    reply.code(201).send(user);
  } catch (error) {
    reply.code(400).send({ error: error.message });
  }
})

fastify.listen({ port: PORT }, err => {
  if (err) throw err
})