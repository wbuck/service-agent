import { expect } from 'chai';
import 'mocha';
import sinon from 'sinon';
import child from 'child-process-promise';
import ServiceController from '../controllers/serviceController';
import httpMocks from 'node-mocks-http';

describe('ServiceController', () => {

    const logger = { log: () => {} };
    let execStub;
    let req;
    let res;

    beforeEach(() => {
        req = httpMocks.createRequest({ method: 'GET' });
        res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
        execStub = sinon.stub(child, 'exec');
    });

    afterEach(() => {
        execStub.restore();
    });
    describe('GET with service name parameter', () => {
        it('should return valid service name and service status with 201 code', (done) => {
            const output = `SERVICE_NAME: FakeService
                        TYPE               : 10  WIN32_OWN_PROCESS
                        STATE              : 4  RUNNING`

            execStub.resolves({
                stdout: output,
                stderr: undefined,
                error: undefined
            });
            req.params.name = 'FakeService';

            let serviceController = new ServiceController(execStub, logger);
            serviceController.get(req, res);

            res.on('end', () => {
                try {
                    expect(res.statusCode).to.equal(201);
                    expect(JSON.parse(res._getData())).to.deep.equal({ "name": "FakeService", "status": "RUNNING" });
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('should fail with 400 code because a service name was not supplied', (done) => {
            let execSpy = sinon.spy();
            delete req.params.name;
            let serviceController = new ServiceController(execSpy, logger);
            serviceController.get(req, res);

            expect(res.statusCode).to.equal(400);
            expect(execSpy.notCalled).to.be.true;
            done();
        });
        it('should reject with 500 code because requested service doesnt exist', (done) => {
            execStub.rejects({ name: 'ChildProcessError', message: 'Command failed: sc query FakeService' });
            req.params.name = 'FakeService';
            let serviceController = new ServiceController(execStub, logger);
            serviceController.get(req, res);

            res.on('end', () => {
                try {
                    expect(res.statusCode).to.equal(500);
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('should fail', (done) => {
            const output = 'String that doesnt match regex pattern';

            execStub.resolves({
                stdout: output,
                stderr: undefined,
                error: undefined
            });
            req.params.name = 'FakeService';

            let serviceController = new ServiceController(execStub, logger);
            serviceController.get(req, res);

            res.on('end', () => {
                try {
                    expect(res.statusCode).to.equal(500);

                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
    })
});