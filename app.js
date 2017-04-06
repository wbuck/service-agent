import express from 'express';
import chalk from 'chalk';
import Service from './services/svc';
import Configuration from './services/configuration';
import portScanner from 'portscanner';

const config = new Configuration();



// Determine if the port supplied by the configuration
// is already in use.
portScanner.checkPortStatus(config.port, '127.0.0.1').then( result => {

}).catch(err => {

});




const app = express();
const port = config.port;


let service = new Service(config.serviceName);

const router = express.Router();
router.route('/state')
    .get((req, res) => {
        service.serviceStatus().then(result => {
            res.json(result);
        }).catch(err => {
            res.status(400).send(`Cannot find service [${service.name}]`);
        });
    });
app.use('/', router);

app.listen(port, () => {
    console.log(chalk.green(`Listening on port ${port}`));
    console.log(chalk.red(__dirname));
});

