const config = require('config').get('Service');

export default class Configuration {
    constructor() {
        this.port = config.has('agent.port') ? config.get('agent.port') : 9000;
        this.host = config.has('agent.host') ? config.get('agent.host') : 'localhost';
        this.serviceName = config.has('monitor.serviceName') ? config.get('monitor.serviceName') : 'Unknown';

    }
}
