import { expect } from 'chai';
import 'mocha';
import sinon from 'sinon';
import child from 'child-process-promise';
import ServiceController from '../controllers/serviceController';
import httpMocks from 'node-mocks-http';

describe('ServiceController', () => {

    const logger = {
        log: {
            warn: () => {},
            error: () => {}
        }
    };
    let execStub;
    let req;
    let res;

    beforeEach(() => {
        req = httpMocks.createRequest({ params: { name: 'FakeService' } });
        res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
        execStub = sinon.stub(child, 'exec');
    });

    afterEach(() => {
        execStub.restore();
    });
    describe('GET route with service name parameter', () => {
        it('should succeed and return valid service name and service status with 200 code', (done) => {
            const output = `SERVICE_NAME: FakeService
                        TYPE               : 10  WIN32_OWN_PROCESS
                        STATE              : 4  RUNNING`;

            req.method = 'GET';
            execStub.resolves({
                stdout: output,
                stderr: undefined,
                error: undefined
            });
            let serviceController = new ServiceController(execStub, logger);
            serviceController.get(req, res);

            res.on('end', () => {
                try {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(res._getData())).to.deep.equal({ "name": "FakeService", "status": "RUNNING" });
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('should fail with 404 code because requested service doesnt exist', (done) => {
            execStub.rejects({
                name: 'ChildProcessError',
                message: 'Command failed: sc query FakeService',
                stdout: '[SC] EnumQueryServicesStatus:OpenService FAILED 1060:\r\n\r\nThe specified service does not exist as an installed service.\r\n\r\n'
            });
            req.method = 'GET';
            let serviceController = new ServiceController(execStub, logger);
            serviceController.get(req, res);

            res.on('end', () => {
                try {
                    expect(res.statusCode).to.equal(404);
                    expect(res._getData()).to.contain('The specified service does not exist as an installed service');
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('should fail with 500 code due to unknown stdout response', (done) => {
            execStub.resolves({
                stdout: 'String that doesnt match regex pattern',
                stderr: undefined,
                error: undefined
            });
            req.method = 'GET';
            let serviceController = new ServiceController(execStub, logger);
            serviceController.get(req, res);

            res.on('end', () => {
                try {
                    expect(res.statusCode).to.equal(500);
                    expect(res._getData()).to.contain('unexpected stdout response');
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
    });
    describe('PATCH route with sent command', () => {
        it('should succeed with 200 code with valid command and service name', (done) => {
            execStub.resolves({
                name: 'ChildProcessError',
                message: 'Command failed: net start DellUpdate',
                stdout: 'The FakeService service is starting.\r\nThe FakeService service was started successfully.'
            });

            req.method = 'PATCH';
            req.params.command = 'start';
            let serviceController = new ServiceController(execStub, logger);
            serviceController.patch(req, res);

            res.on('end', () => {
                try {
                    expect(res.statusCode).to.equal(200);
                    expect(res._getData()).to.contain('The FakeService service was started successfully');
                    done();
                } catch (ex) {
                    done(ex);
                }

            });
        });
        it('should fail with 400 because an invalid command was supplied', () => {
            let execSpy = sinon.spy();
            req.method = 'PATCH';
            req.params.command = 'restart';
            let serviceController = new ServiceController(execSpy, logger);
            serviceController.patch(req, res);

            expect(res.statusCode).to.equal(400);
            expect(execSpy.notCalled).to.be.true;
        });
        it('should fail with 400 when a request is made to start a service that is already started', (done) => {
            execStub.rejects({
                name: 'ChildProcessError',
                message: 'Command failed: net start DellUpdate',
                stdout: 'The requested service has already been started'
            });
            req.method = 'PATCH';
            req.params.command = 'start';
            let serviceController = new ServiceController(execStub, logger);
            serviceController.patch(req, res);

            res.on('end', () => {
                try {
                    expect(res.statusCode).to.equal(400);
                    done();
                } catch (ex) {
                    done(ex);
                }

            });
        });
        it('should fail with 400 when a request is made to start a service that doesnt exist', (done) => {
            execStub.rejects({
                name: 'ChildProcessError',
                message: 'Command failed: net start FakeService',
                stdout: 'The service name is invalid.\r\n\r\nMore help is available by typing NET HELPMSG 2185.'
            });
            req.method = 'PATCH';
            req.params.command = 'start';
            let serviceController = new ServiceController(execStub, logger);
            serviceController.patch(req, res);

            res.on('end', () => {
                try {
                    expect(res.statusCode).to.equal(400);
                    expect(res._getData()).to.contain('The service name is invalid');
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
    });
});