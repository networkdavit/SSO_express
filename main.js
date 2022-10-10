const express = require('express')
const sqlite3 = require('sqlite3').verbose();
const bodyparser = require('body-parser')
const crypto = require("crypto");
const jsonparser = bodyparser.json()
const app = express()
const port = 5000

const SECRET = "supersecretkey"

app.use(jsonparser)

let db = new sqlite3.Database('main.db')
db.run("CREATE TABLE IF NOT EXISTS users(email TEXT, onetimepasswordaccess INTEGER, sso TEXT)")

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register', (req, res) => {
    const email = req.body["email"]
    db.run("INSERT INTO users (email) VALUES (?)", email,function(err){
        if(err){
            res.send(JSON.stringify({status: "Error Reigstering"}))
        }
        res.send(JSON.stringify({status: "Registered"}))
    } )
})

app.post('/getaccess', (req, res) => {
    const email = req.body["email"]
    const onetimepasswordaccessinteger = Math.floor(Math.random() * 100) + 1;
    const one_time_code = SECRET + onetimepasswordaccessinteger + email
    const hashed_one_time_code = crypto.createHash('sha256').update(one_time_code).digest('HEX');
    console.log(hashed_one_time_code)

    db.run("UPDATE users SET onetimepasswordaccess = ?, sso = ? WHERE email = ?", [hashed_one_time_code, onetimepasswordaccessinteger, email],function(err){
        if(err){
            res.send(JSON.stringify({status: "Error sending SSO"}))
        }
        res.send(JSON.stringify({one_time_access: "Check your email"}))
    } )  
})

app.post('/login', (req, res) => {
    const email = req.body["email"]
    const onetimepasswordaccess = req.body["onetimepasswordaccess"]
    db.get("SELECT * FROM users WHERE email = ?", email, function(err, row){
        if(err || row == undefined){
            res.send(JSON.stringify({status: "Wrong credentials"}))
        }
        else if (row.onetimepasswordaccess == onetimepasswordaccess){
            res.send(JSON.stringify({status: "Logged in"}))
        }
        else{
            res.send(JSON.stringify({status: "Wrong credentials"}))
        }
    })
})
  

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

