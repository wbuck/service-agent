import express from 'express';
import { exec } from 'child-process-promise';
import ServiceController from '../controllers/serviceController';

module.exports = (logger) => {
    const router = express.Router();
    let controller = new ServiceController(exec, logger);

    router.route('/:name')
        .get(controller.get);
    router.route('/:name/:command')
        .patch(controller.patch);

    return router;
};