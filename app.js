const express  = require("express");
const app      = express();
const request  = require("request");
const pool     = require("./dbPool.js");

app.set("view engine", "ejs");
app.use(express.static("public"));

//routes

app.get("/", async function(req, res){

    res.render("index");

});


app.get("/search", async function(req, res){
    let movieInfo = await getMovie(req.query.movieName);
    res.render("results", {"movieInfo": movieInfo});
});//search


app.get("/api/update", function(req, res){
    let sql;
    let sqlParams;
    switch (req.query.action) {
        case "add": 
            sql = "INSERT INTO movies (imdb_id, name, poster_url) VALUES (?,?,?) ON DUPLICATE KEY UPDATE imdb_id = VALUES(imdb_id)";
            sqlParams = [req.query.imdb, req.query.name, req.query.poster];
            break;
        case "delete": 
            sql = "DELETE FROM movies WHERE imdb_id = ?";
            sqlParams = [req.query.imdb];
            break;
    }//switch
    pool.query(sql, sqlParams, function (err, rows, fields) {
        if (err) throw err;
    });

    sql = "SELECT name, poster_url, imdb_id FROM movies ORDER BY name";
    pool.query(sql, function(err, rows, fields) {
        if (err) throw err;
        console.log(rows);
        res.redirect("/getMovies");
    });
      
  });//api/update

app.get("/getMovies", function(req, res){
    let sql = "SELECT name, poster_url, imdb_id FROM movies ORDER BY name";
    let movieArray = ["img/favorite.png"];
    pool.query(sql, function(err, rows, fields) {
        if (err) throw err;
        console.log(rows);
        res.render("favorites", { "movieArray": movieArray, "rows": rows });
    });
});//getMovies

app.get("/getDetails",async function(req, res){
    let movieInfo = await getMovie(req.query.name);
    res.render("details", {"movieInfo": movieInfo});
    
});//getDetails

async function getMovie(movieName) {
    
    return new Promise (function (resolve, reject){
    let requestUrl = `http://www.omdbapi.com/?apikey=4f35f1eb&t=${movieName}`;
    
    request(requestUrl, function (error, response, body) {
        if (!error && response.statusCode == 200){
            
            let parsedData = JSON.parse(body);
            //console.log(parsedData);
            let movieInfo = [];
            movieInfo['img'] = parsedData['Poster'];
            movieInfo['name'] = parsedData['Title'];
            movieInfo['genre'] = parsedData['Genre'];
            movieInfo['date'] = parsedData['Released'];
            movieInfo['time'] = parsedData['Runtime'];
            movieInfo['plot'] = parsedData['Plot'];
            movieInfo['revenue'] = parsedData['BoxOffice'];
            movieInfo['rating'] = parsedData['imdbRating'];
            movieInfo['id'] = parsedData['imdbID'];
            console.log(movieInfo);

            resolve (movieInfo);
        }
        
        else {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode)
            reject(error)
        }
    });
    });
}

//starting server

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Express server is running...");
});
