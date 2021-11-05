const express = require(`express`);

const db = require("./dbConnectExec.js");

const app = express();

app.listen(5000, ()=>{console.log("App is running on port 5000")})

app.get("/hi",(req, res)=>{
    res.send("Hello World")})

app.get("/",(req, res)=>{
    res.send("API Is Running")})

// app.post()
// app.put()

app.get("/books",(req, res)=>{
    db.executeQuery(`Select * 
    FROM Book 
    LEFT JOIN Authors
    on Authors.AuthorID = Book.AuthorID`)

    .then((theResults)=>{
        res.status(200).send(theResults)
    })
    .catch((myError)=>{
        res.status(500).send();
    })
})
app.get("/books/:BookID", (req, res) => {
    let bookID = req.params.BookID;
    //   console.log(pk);
    let myQuery = `Select * 
    FROM Book 
    LEFT JOIN Authors
    on Authors.AuthorID = Book.AuthorID
    WHERE BookID = ${bookID}`;
  
    db.executeQuery(myQuery)
      .then((result) => {
        // console.log("result", result);
        if (result[0]) {
          res.send(result[0]);
        } else {
          res.status(404).send(`bad request`);
        }
      })
      .catch((err) => {
        console.log("Error in /movies/:pk", err);
        res.status(500).send();
      });
    })
