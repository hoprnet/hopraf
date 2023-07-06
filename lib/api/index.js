import express from 'express';
import http from 'http';
import { debug } from '@hoprnet/hopr-utils';
import * as apiV2 from './v2.js';
import { WebSocketServer } from 'ws';
const debugLog = debug('hoprd:api');
export default function setupAPI(node, logs, stateOps, options) {
    debugLog('Enabling Rest API v2 and WS API v2');
    const service = express();
    const server = http.createServer(service);
    apiV2.setupRestApi(service, '/api/v2', node, stateOps, options);
    apiV2.setupWsApi(server, new WebSocketServer({ noServer: true }), node, logs, options);
    return function listen() {
        server
            .listen(options.apiPort, options.apiHost, () => {
            logs.log(`API server on ${options.apiHost} listening on port ${options.apiPort}`);
        })
            .on('error', (err) => {
            logs.log(`Failed to start API server: ${err}`);
            // bail out, fail hard because we cannot proceed with the overall
            // startup
            throw err;
        });
    };
}
//# sourceMappingURL=index.js.map