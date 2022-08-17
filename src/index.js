import init from '../server/plugin.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const fastify = require('fastify');

const app = fastify({ logger: { prettyPrint: true } });

export default init(app);
