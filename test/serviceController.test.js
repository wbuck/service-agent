import { expect } from 'chai';
import 'mocha';
import sinon from 'sinon';
import child from 'child-process-promise';
import ServiceController from '../controllers/serviceController';
import httpMocks from 'node-mocks-http';

describe('ServiceController', () => {
    const output = `SERVICE_NAME: FakeService
                    TYPE               : 10  WIN32_OWN_PROCESS
                    STATE              : 4  RUNNING`

    let req;
    let res;

    const logger = { log: (...messages) => {} };

    let execStub;

    beforeEach(() => {
        req = httpMocks.createRequest({ method: 'GET' });
        res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
        execStub = sinon.stub(child, 'exec');
    });

    afterEach(() => {
        execStub.restore();
    });

    it('GET - should return valid service name and service status with 201 code', (done) => {

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
    it('GET - should fail because a name was not supplied', (done) => {
        let execSpy = sinon.spy();
        delete req.params.name;
        let serviceController = new ServiceController(execSpy, logger);
        serviceController.get(req, res);

        expect(res.statusCode).to.equal(400);
        expect(execSpy.notCalled).to.be.true;
        done();
    });
    it('GET - should reject because requested service doesnt exist', (done) => {
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
});