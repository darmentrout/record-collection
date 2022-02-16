const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const db_name = "record-collection.db";
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'record-collection.db'");
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(3000, () => { 
  console.log("Server started (http://localhost:3000/) !");
});

app.get("/", (req, res) => { 
  res.send ("Hello world...");
});

app.post("/add", (req, res) => {
    // curl -X POST -d "artist=the%20cure&title=wish&year=1994&media=cd&notes=" localhost:3000/add
    const query = "INSERT INTO records (artist, title, year, media, notes) VALUES(?,?,?,?,?)";
    const values = Object.values(req.body);
    console.log(values);
    db.run(query, values, function(err){ // classic function to be able to use this
        if(err){
            res.redirect("/");
            return console.log(err.message);
        }
        // console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.end(`row ${this.lastID} added`);
      });
      db.close();
});

