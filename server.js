const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const db_name = 'record-collection.db';
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Successful connection to the database record-collection.db');
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 3000;
app.listen(port, () => { 
  console.log(`Server started http://localhost:${port}/`);
});

app.get('/', (req, res) => { 
  res.send ('Hello world...');
});

app.post('/add', (req, res) => {
  // curl -X POST -d "artist=the%20cure&title=wish&year=1994&media=cd&notes=" localhost:3000/add
  const query = 'INSERT INTO records (artist, title, year, media, notes) VALUES(?,?,?,?,?)';
  const values = Object.values(req.body);
  db.run(query, values, function(err){ // classic function to be able to use this
    if(err){
      res.end(err.message);
      return;
    }
    res.end(`record ID #${this.lastID} added`);
  });
});

app.get('/id/:id', (req, res) => {
  const query = 'SELECT * FROM records WHERE ID = ?';
  db.all(query, [req.params.id], function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    res.json(rows[0]);
  });
});

app.get('/artists', (req, res) => {
  const query = 'SELECT artist FROM records ORDER BY artist ASC';
  db.all(query, [], function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    const artistArray = rows.map(x => x.artist);
    res.json(artistArray);
  });
});

app.get('/random', (req, res) => {
  const query = 'SELECT * FROM records ORDER BY RANDOM() LIMIT 1;';
  db.all(query, [], function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    res.json(rows[0]);
  });
});

// search by different properties (artist, year, title)

app.get('/search/:needle', (req, res) => { 
  // concatenate (||) the wildcards (%) with the placeholder (?)
  const query = "SELECT * FROM records WHERE artist LIKE '%' || ? || '%' OR title LIKE '%' || ? || '%'";
  db.all(query, [req.params.needle, req.params.needle], function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    res.json(rows);
  });
});