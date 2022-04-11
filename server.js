const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const db_name = 'record-collection.db';
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(`Successful connection to the database ${db_name}`);
});

db.run(`CREATE TABLE if not exists records (
  id integer primary key autoincrement,
  artist text,
  title text,
  year integer,
  media text,
  notes text
)`);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 3000;
app.listen(port, () => { 
  console.log(`Server started http://localhost:${port}/`);
});

app.use(express.static(__dirname));

app.get('/', (req, res) => { 
  res.sendFile(__dirname + "/index.html"); 
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
    res.end(`Record ID #${this.lastID} Added`);
  });
});

app.delete('/delete/:id', (req, res) => {
  // curl -X DELETE localhost:3000/delete/12
  const query = 'DELETE FROM records WHERE id = ?';
  db.run(query, [req.params.id], function(err){ 
    if(err){
      res.end(err.message);
      return;
    }
    res.end(`record ID #${req.params.id} deleted`);
  });
});

app.put('/update/:id', (req, res) => {
  // curl -X PUT -d "artist=the%20cure&title=wish&year=1994&media=cd&notes=" localhost:3000/update/1
  const query = `UPDATE records SET artist = ?, title = ?, year = ?, media = ?, notes = ? WHERE id = ${req.params.id}`;
  const values = Object.values(req.body);
  db.run(query, values, function(err){ // classic function to be able to use this
    if(err){
      res.end(err.message);
      return;
    }
    res.end(`Record ID #${req.params.id} Updated`);
  });
});

app.get('/catalog', (req, res) => {
  let query = 'SELECT * FROM records ORDER BY artist ';
  let pagination = [];
  if(req.query.limit && req.query.offset){
    query += `LIMIT ? OFFSET ?`;
    pagination.push(req.query.limit);
    pagination.push(req.query.offset);
  }
  db.all(query, pagination, function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    if(rows.length <= 0){
      res.json({ "results": "none"});
      return;
    }
    res.json(rows);
  });
});

app.get('/id/:id', (req, res) => {
  const query = 'SELECT * FROM records WHERE ID = ?';
  db.all(query, [req.params.id], function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    if(rows.length <= 0){
      res.json({ "results": "none"});
      return;
    }
    res.json(rows[0]);
  });
});

app.get('/artist-list', (req, res) => {
  const query = 'SELECT artist FROM records ORDER BY artist ASC';
  db.all(query, [], function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    if(rows.length <= 0){
      res.json({ "results": "none"});
      return;
    }
    const artistArray = rows.map(x => x.artist);
    const dedupedArtistArray = [...new Set(artistArray)];
    res.json(dedupedArtistArray);
  });
});

app.get('/artist/:artist', (req, res) => {
  let query = "SELECT * FROM records WHERE artist = ? ORDER BY ";
  const filters = ['title', 'year', 'media', 'notes'];
  if(req.query.filter && filters.indexOf(req.query.filter) > -1){  
    query += `${req.query.filter} ASC`;
  }
  else {
    query += 'title ASC';
  }
  db.all(query, [req.params.artist], function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    if(rows.length <= 0){
      res.json({ "results": "none"});
      return;
    }
    res.json(rows);
  });
});

app.get('/random', (req, res) => {
  const query = 'SELECT * FROM records ORDER BY RANDOM() LIMIT 1;';
  db.all(query, [], function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    if(rows.length <= 0){
      res.json({ "results": "none"});
      return;
    }
    res.json(rows[0]);
  });
});

app.get('/search/:needle', (req, res) => { 
  // concatenate (||) the wildcards (%) with the placeholder (?)
  let query = "SELECT * FROM records WHERE \
         artist LIKE '%' || $needle || '%' \
       OR title LIKE '%' || $needle || '%' \
       OR notes LIKE '%' || $needle || '%' ORDER BY ";
  const filters = ['artist', 'title', 'year', 'media', 'notes'];
  if(req.query.filter && filters.indexOf(req.query.filter) > -1){  
    query += `${req.query.filter} ASC`;
  }
  else {
    query += 'artist ASC';

  }
  db.all(query, { $needle: req.params.needle}, function(err, rows){
    if(err){
      res.end(err.message);
      return;
    }
    if(rows.length <= 0){
      res.json({ "results": "none"});
      return;
    }
    res.json(rows);
  });
});