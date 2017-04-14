import express from 'express';
import Configuration from './services/configuration';
import portScanner from 'portscanner';
import Logger from './services/logging';
import path from 'path';

const logger = new Logger(path.join(__dirname, 'logs', 'agent.log'));
const config = new Configuration();
const port = config.port;
const app = express();

// Determine if the port supplied by
// the configuration is already in use.
portScanner.checkPortStatus(port, '127.0.0.1').then(result => {

    if (result === 'open') {
        throw new Error(`PORT ${config.port} is already in use`);
    }

    const router = require('./routes/serviceRouter')(logger);

    app.use('/service/status', router);

    app.get('/', (req, res) => {
        // TODO: Return some html in stead of just text.
        res.send('Welcome');
    });

    app.listen(port, () => {
        logger.log.info(`Listening on port [${port}]`);
    });

    return result;

}).catch(err => {
    logger.log.error(`${err.name} ${err.message}`);
});