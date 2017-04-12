export default class ServiceController {
    constructor(exec, logger) {
        this.logger = logger;
        this.exec = exec;
        this.get = this.get.bind(this);
    }
    get(req, res) {
        if (!req.params.name) {
            res.status(400).send('A service name was not provided');
        } else {
            this.exec(`sc query ${req.params.name}`).then(result => {
                if (result.stderr) {
                    this.logger.log('warn', `stderr: ${result.stderr}`);
                }
                const regex = /STATE\s+:\s+\d+\s+(\w+)/;
                let [, status] = result.stdout.toString().match(regex);
                if (!status) {
                    throw new Error('Status query unsuccessful');
                }

                let service = {
                    name: req.params.name,
                    status: status
                };

                res.status(201).json(service);
                return service;

            }).catch(err => {
                this.logger.log('error', `${err.name} ${err.message}`);
                res.status(500).send(`${err.name} ${err.message}`);
            });
        }
    }
}