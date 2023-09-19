const pg = require('pg');
const client = new pg.Client('postgres://localhost/iceCreamShop_backend_db');
const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());

app.get('/api/flavors', async(req, res, next)=> {
    try {
        const SQL = `
            SELECT *
            FROM flavors
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
})

app.get('/api/flavors/:id', async(req, res, next)=> {
    try {
        const SQL = `SELECT * FROM flavors where id=$1;`;
        const response = await client.query(SQL, [req.params.id]);
        if(!response.rows.length){
            next({
                name:"IdError",
                message:`Flavor with id ${req.params.id} not found`,
            })
        };
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
})

app.delete("/api/flavors/:id", async(req, res, next) => {
    const SQL = 'DELETE FROM flavors WHERE id=$1 RETURNING *;'

    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
})

app.use((error, req, res, next)=> {
    res.send(error);
    res.status(500);
})

const setup = async()=> {
    await client.connect();
    console.log('Connected to the database');
    const SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            description VARCHAR(500)
        );
        INSERT INTO flavors (name, description) VALUES ('Vanilla', 'Our homemade vanilla ice cream is made by blending vanilla essence, eggs, cream, milk, and sugar.');
        INSERT INTO flavors (name, description) VALUES ('Chocolate', 'Our homemade chocolate ice cream is made by blending cocoa powder with eggs, cream, vanilla, and sugar.');
        INSERT INTO flavors (name, description) VALUES ('Strawberry', 'Our homemade strawberry ice cream is made with juicy and ripe strawberries and churned and frozen with fresh cream and sugar.');
    `;
    await client.query(SQL);

    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`Listening on port ${port}`);
    });
}
setup()