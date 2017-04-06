import {exec} from 'child_process';

export default class Service {
    constructor(serviceName) {
        this.name = serviceName;
    }

    serviceStatus() {
        return new Promise((resolve, reject) => {
            exec(`sc query ${this.name}`, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    const regex = /STATE\s+:\s+\d+\s+(\w+)/;
                    let [, status] = stdout.toString().match(regex);
                    let service = {
                        serviceName: this.name,
                        serviceStatus: status || "UNKNOWN"
                    };
                    resolve(service);
                }
            });
        })
    }
};

/*
 const regex = /STATE\s+:\s+\d+\s+(\w+)/;
 let [, status] = stdout.toString().match(regex);
 service.status = status || 'UNKNOWN';
 */