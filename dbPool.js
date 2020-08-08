const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit: 10,
    host: "rnr56s6e2uk326pj.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "phz3atytfwyvdu89",
    password: "rrmsxs626m1qag4q",
    database: "jns1cs3u2zbzm3mp"
});


module.exports = pool;