import express from 'express';
import chalk from 'chalk';

const port = process.env.PORT || 9000;

const app = express();

app.get( '/', ( req, res ) =>
{
    let serviceStatus = {
        state: 'Running',
        name: 'Rip Agent'
    };

    res.send( serviceStatus );
} );

app.listen( port, () =>
{
    console.log( chalk.green( `Listening on port ${port}` ) );
} );