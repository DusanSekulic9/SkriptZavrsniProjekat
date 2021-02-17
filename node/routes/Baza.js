const express = require('express');
const Joi = require('joi');
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'test'
});

var admin = false;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const route = express.Router();
const bcrypt = require('bcrypt');


const sema = Joi.object().keys({
    marka: Joi.string().trim().required(),
    model: Joi.string().trim().required(),
    procesor: Joi.string().trim().required(),
    verzija: Joi.string().trim().required()
});


const link = Joi.object().keys({
    id: Joi.number().min(1).max(50).required()
});

const userSema = Joi.object().keys({
    username : Joi.string().min(2).max(40).required(),
    password : Joi.string().min(2).max(15).required()
})

const loginSema = Joi.object().keys({
    username : Joi.string().min(2).max(40).required(),
    password : Joi.string().min(2).max(15).required()
})
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    console.log(hash)
}

route.get('/isAdmin',(req ,res)=>{
    res.send(admin);
});

route.post('/register',jsonParser, (req,res)=>{
    let { error } = userSema.validate(req.body);
    if (error){
        console.log(error)
        res.status(400).send(error.details[0].message);
    }else{
        const name = req.body.username;
        var password= req.body.password;

        let errors = [];

        if(!name  || !password  ){
            errors.push({msg: 'Please fill in all the fields'});
            res.send({message:'Please fill in all the fields'});
        }
        if(errors.length>0){

        }else{
            if(name){
                pool.query('SELECT * FROM users WHERE username = ?', [name],
                    (error, results, fields)=>{
                        if (results.length>0){
                            res.send('username exists');
                            alert('Username exists');
                        }else{
                            res.send('Reg success')
                            bcrypt.hash(password, 5, (err, hash)=> {
                                if(err)throw err;
                                password = hash;
                                pool.query('INSERT INTO users(username, password, admin) VALUES(?,?,?)',
                                    [name,password,0]);
                            });

                        }

                    });
            }else{
                res.send('Enter Email');
            };
        }
    }

});
route.post('/login',jsonParser, (req, res)=> {
    let { error } = loginSema.validate(req.body);
    console.log(req.body.username)
    console.log(req.body.password)
    if (error){
        res.status(400).send(error.details[0].message);
    }else {
        const username = req.body.username;
        const password = req.body.password;

        if (username && password) {
            pool.query('SELECT * FROM users WHERE username = ?', [username],
                (error, results, fields) => {
                    if(error || results.length == 0) {
                        res.send('There is no user with this username');
                        alert('There is no user with this username');
                        res.end();
                    }
                    var ad = results[0].Admin;
                    console.log(ad);
                    console.log(results[0]);
                    pass = results[0].Password;
                    if(ad != 0){
                        console.log('admin');
                        if(pass == password){
                            admin = true;
                            console.log('admin true');
                            res.send(results[0]);
                            return;
                        }
                    }
                    if (bcrypt.compareSync(password, pass)) {
                        console.log('false');
                        admin = false;
                        res.send(results[0]);
                    } else {
                        console.log('false2');
                        res.send('Incorrect Email and/or Password!');
                    }
                    res.end();
                });
        } else {
            res.send('Please enter Username and Password!');
            res.end();
        }
    }
});


route.use(express.json());


route.get('/telefoni', (req, res) => {
    pool.query('select * from telefoni', (err, rows) => {
        if (err)
            res.status(500).send(err.sqlMessage);
        else
            res.send(rows);
    });
});


route.post('/telefoni', (req, res) => {
    let { error } = Joi.validate(req.body, sema);

    if (error)
        res.status(400).send(error.details[0].message);

    else {
        let query = "insert into telefoni (marka, model, procesor, verzija) values (?, ?, ?, ?)";
        let formated = mysql.format(query, [req.body.marka, req.body.model, req.body.procesor, req.body.verzija]);

        pool.query(formated, (err, response) => {
            if (err)
                res.status(500).send(err.sqlMessage);
            else {
                query = 'select * from telefoni where id=?';
                formated = mysql.format(query, [response.insertId]);

                pool.query(formated, (err, rows) => {
                    if (err)
                        res.status(500).send(err.sqlMessage);
                    else
                        res.send(rows[0]);
                });
            }
        });
    }
});

route.get('/telefon/:id', (req, res) => {
    let {error} = Joi.validate(req.params, link);

    if(error){
        res.status(400).send(error.details[0].message);
    }else {
        let query = 'select * from telefoni where id=?';
        let formated = mysql.format(query, [req.params.id]);

        pool.query(formated, (err, rows) => {
            if (err)
                res.status(500).send(err.sqlMessage);
            else
                res.send(rows[0]);

        });
    }
});

route.put('/telefon/:id', (req, res) => {

    let { error } = Joi.validate(req.params, link);

    if (error) {
        res.status(400).send(error.details[0].message);
    }
    else {
        let { error } = Joi.validate(req.body, sema);
        if(error){
            res.status(400).send(error.details[0].message);
        }
        else {
            let query = "update telefoni set marka=?, model=?, procesor = ?, verzija = ? where id=?";
            let formated = mysql.format(query, [req.body.marka, req.body.model, req.body.procesor, req.body.verzija, req.params.id]);

            pool.query(formated, (err, response) => {
                if (err)
                    res.status(500).send(err.sqlMessage);
                else {
                    query = 'select * from telefoni where id=?';
                    formated = mysql.format(query, [req.params.id]);

                    pool.query(formated, (err, rows) => {
                        if (err)
                            res.status(500).send(err.sqlMessage);
                        else
                            res.send(rows[0]);
                    });
                }
            });
        }
    }

});


route.delete('/telefon/:id', (req, res) => {
    let {error} = Joi.validate(req.params, link);
    if(error)
        res.status(400).send(error.details[0].message);
    else
    {
        let query = 'select * from telefoni where id=?';
        let formated = mysql.format(query, [req.params.id]);

        pool.query(formated, (err, rows) => {
            if (err)
                res.status(500).send(err.sqlMessage);
            else {
                let telefon = rows[0];

                let query = 'delete from telefoni where id=?';
                let formated = mysql.format(query, [req.params.id]);

                pool.query(formated, (err, rows) => {
                    if (err)
                        res.status(500).send(err.sqlMessage);
                    else
                        res.send(telefon);
                });
            }
        });
    }
});


//////TABLETI


route.get('/tableti', (req, res) => {
    pool.query('select * from tableti', (err, rows) => {
        if (err)
            res.status(500).send(err.sqlMessage);
        else
            res.send(rows);
    });
});


route.post('/tablet', (req, res) => {
    let { error } = Joi.validate(req.body, sema);

    if (error)
        res.status(400).send(error.details[0].message);

    else {
        let query = "insert into tableti (marka, model, procesor, verzija) values (?, ?, ?, ?)";
        let formated = mysql.format(query, [req.body.marka, req.body.model, req.body.procesor, req.body.verzija]);

        pool.query(formated, (err, response) => {
            if (err)
                res.status(500).send(err.sqlMessage);
            else {
                query = 'select * from tableti where id=?';
                formated = mysql.format(query, [response.insertId]);

                pool.query(formated, (err, rows) => {
                    if (err)
                        res.status(500).send(err.sqlMessage);
                    else
                        res.send(rows[0]);
                });
            }
        });
    }
});

route.get('/tablet/:id', (req, res) => {
    let {error} = Joi.validate(req.params, link);

    if(error){
        res.status(400).send(error.details[0].message);
    }else {
        let query = 'select * from tableti where id=?';
        let formated = mysql.format(query, [req.params.id]);

        pool.query(formated, (err, rows) => {
            if (err)
                res.status(500).send(err.sqlMessage);
            else
                res.send(rows[0]);

        });
    }
});

route.put('/tablet/:id', (req, res) => {

    let { error } = Joi.validate(req.params, link);

    if (error) {
        res.status(400).send(error.details[0].message);
    }
    else {
        let { error } = Joi.validate(req.body, sema);
        if(error){
            res.status(400).send(error.details[0].message);
        }
        else {
            let query = "update tableti set marka=?, model=?, procesor = ?, verzija = ? where id=?";
            let formated = mysql.format(query, [req.body.marka, req.body.model, req.body.procesor, req.body.verzija, req.params.id]);

            pool.query(formated, (err, response) => {
                if (err)
                    res.status(500).send(err.sqlMessage);
                else {
                    query = 'select * from tableti where id=?';
                    formated = mysql.format(query, [req.params.id]);

                    pool.query(formated, (err, rows) => {
                        if (err)
                            res.status(500).send(err.sqlMessage);
                        else
                            res.send(rows[0]);
                    });
                }
            });
        }
    }

});


route.delete('/tablet/:id', (req, res) => {
    let {error} = Joi.validate(req.params, link);
    if(error)
        res.status(400).send(error.details[0].message);
    else
    {
        let query = 'select * from tableti where id=?';
        let formated = mysql.format(query, [req.params.id]);

        pool.query(formated, (err, rows) => {
            if (err)
                res.status(500).send(err.sqlMessage);
            else {
                let tablet = rows[0];

                let query = 'delete from tableti where id=?';
                let formated = mysql.format(query, [req.params.id]);

                pool.query(formated, (err, rows) => {
                    if (err)
                        res.status(500).send(err.sqlMessage);
                    else
                        res.send(tablet);
                });
            }
        });
    }
});

module.exports = route;