import express from 'express';
import http from 'http';
import pg from 'pg';
import randomInt from 'random-int';
import cors from 'cors';

const SERVER_PORT = 3000;
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

const client = new pg.Pool({
    // host: 'localhost',
    // user: 'guestdba',
    // password: 'guest123',
    // database: 'guestdb',
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
});

export function health() {
    const router = new express.Router();

    router.get('/', (req, res) => {
        res.status(200);
        res.json({status: 'OK'});
    });

    return router;
};

export function insertMessages() {
    const router = new express.Router();
    router.post('/', (request, response) => {  
        const name = request.body.name;
        const message = request.body.message;
        const sql = 'INSERT INTO guest(id, name, message, created_on) VALUES ($1, $2, $3, to_timestamp($4));'
        client.query(
            sql, [randomInt(99999), name, message, Math.round(new Date().getTime()/1000)],
            (err, result) => {
                if (err) {
                    throw err
                }
            
                response.header("Access-Control-Allow-Origin", "*"); 
                response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                response.sendStatus(200);
            })
    });

    return router;
};

export function getAllMessages() {
    const router = new express.Router();

    router.get('/', (request, response) => {
        const sql = 'SELECT * FROM guest ORDER BY created_on DESC;'
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        client.query(
            sql,
            (err, result) => {
                if (err) {
                    throw err
                }
            
                response.status(200).json(result.rows);
        })   
    });

    return router;
};

export function server() {
    console.log(`Server is listeninig on port ${SERVER_PORT}`);
    const routes = {
        '/api/health': health(),
        '/api/add': insertMessages(),
        '/api/getAll': getAllMessages(),
    };

  return createServer(routes);
}

export function createServer(routes) {

    const app = express();
    app.use(cors())

    // app.use(express.static('resource'))
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    Object.keys(routes).forEach(routeName => {
        app.use(routeName, routes[routeName]);
    });
    
    const server = http.createServer(app);
    server.listen(SERVER_PORT, "0.0.0.0");

    return server;
}

server();
