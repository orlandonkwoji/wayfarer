import 'core-js/stable';
import 'regenerator-runtime/runtime';
import http from 'http';
import app from './app';
import { log } from './src/utils';

const PORT = process.env.PORT || 4800;
const server = http.createServer(app);
server.listen(PORT, log(`App is listening on port ${PORT}`));

export default server;
