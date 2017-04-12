import winston from 'winston';
import moment from 'moment';

// Sets up the Winston logger.
export default class Logger {
    constructor( path ) {
        this.path = path;
        this.log = new (winston.Logger)( {
            transports: [
                new (winston.transports.Console)( {
                    timestamp: () => moment().format( 'YYYY-MM-D h:mm:ss.SSS a' ),
                    colorize: true,
                    formatter: options => {
                        return `[${options.timestamp()}] [${winston.config.colorize( options.level, options.level.toUpperCase() )}] -> ${options.message || ''}`
                    }
                } ),
                new (winston.transports.File)( {
                    filename: path,
                    json: false,
                    timestamp: () => moment().format( 'YYYY-MM-D h:mm:ss.SSS a' ),
                    formatter: options => {
                        return `[${options.timestamp()}] [${options.level.toUpperCase()}] -> ${options.message || ''}`
                    }
                } )
            ]
        } );
    }
}