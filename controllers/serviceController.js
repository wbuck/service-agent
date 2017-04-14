export default class ServiceController {
    constructor(exec, logger) {
        this.logger = logger;
        this.exec = exec;
        this.get = this.get.bind(this);
        this.patch = this.patch.bind(this);
    }
    get(req, res) {
        this.exec(`sc query ${req.params.name}`).then(result => {
            if (result.stderr) {
                this.logger.log.warn(`stderr: ${result.stderr}`);
            }
            const regex = /STATE\s+:\s+\d+\s+(\w+)/;
            let match = result.stdout.toString().match(regex);

            if (!match) {
                throw new Error(`unexpected stdout response: [${result.stdout.toString()}]`);
            }

            let [, status] = match;
            let service = {
                name: req.params.name,
                status: status
            };

            res.status(200).json(service);
            return service;

        }).catch(err => {
            if (err.stdout || err.stderr) {
                this.logger.log.error(`${err.name} ${err.message} ${err.stdout || err.stderr}`);
                res.status(404).send(`${err.stdout || err.stderr}`);
            } else {
                this.logger.log.error(`${err.name} ${err.message}`);
                res.status(500).send(`${err.name} ${err.message}`);
            }
        });
    }
    patch(req, res) {
        if (!/^start$/i.test(req.params.command.trim()) &&
            !/^stop$/i.test(req.params.command.trim())) {
            this.logger.log.error(`Unsupported command ${req.params.command}`);
            res.status(400).send('Only start and stop commands are supported');
            return;
        }
        this.exec(`net ${req.params.command} ${req.params.name}`).then(result => {
            res.status(200).send(result.stdout);
            return result;

        }).catch(err => {
            if (err.stdout || err.stderr) {
                this.logger.log.error(`${err.stderr || err.stdout} ${err.message}`);
                res.status(400).send(err.stderr || err.stdout);
            } else {
                this.logger.log.error(`${err.name} ${err.message}`);
                res.status(500).send(err.message);
            }
        });
    }
}