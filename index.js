const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const db_name = 'record-collection.db';
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Successful connection to the database record-collection.db');
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(3000, () => { 
  console.log('Server started (http://localhost:3000/) !');
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
    res.end(`row ${this.lastID} added`);
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