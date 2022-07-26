// //// @ts-check
import fastify from 'fastify';
import init from '../server/plugin.js';
import 'dotenv/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const app = fastify({ logger: { prettyPrint: true } });

// Declare a route
// fastify.get('/', function (req, res) {
//   res.send({ hello: 'world' });
// });

// Run the server!
// const port = process.env.PORT || 5000;
// fastify.listen({ port }, (err, address) => {
//   if (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
//   fastify.log.info(`server listening on ${address}`);
// });

export default init(app);
