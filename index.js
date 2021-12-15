const express = require(`express`);
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./dbConnectExec.js");
const dbConfig =  require("./config.js")
const auth = require("./middleware/authenticate.js")

const app = express();
app.use(express.json());

//azurewebsites.net, colostate.edu
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
})



app.get("/hi",(req, res)=>{
    res.send("Hello World")})

app.get("/",(req, res)=>{
    res.send("API Is Running")})

// app.post()
// app.put()
app.post("/customers/logout", auth, (req,res)=>{
  let query = `UPDATE customers
  SET token = NULL
  WHERE CustomerID = ${req.customer.CustomerID}`;

  db.executeQuery(query)
    .then(()=>{res.status(200).send()})
    .catch((err)=>{
      console.log("error in POST /customers/logout", err);
      res.status(500).send()
    })
})


app.get("/customers/me",auth,(req,res)=>{
  res.send(req.customer)
})

app.post("/customers/login", async (req, res) => {
  // console.log("/customers/login called", req.body);

  //1. data validation
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Bad request");
  }

  //2. check that user exists in DB

  let query = `SELECT *
  FROM customers
  WHERE email = '${email}'`;

  let result;
  try {
    result = await db.executeQuery(query);
  } catch (myError) {
    console.log("error in /customers/login", myError);
    return res.status(500).send();
  }

  // console.log("result", result);

  if (!result[0]) {
    return res.status(401).send("Invalid user credentials");
  }

  //3. check password
  let user = result[0];

  if (!bcrypt.compareSync(password, user.Password)) {
    console.log("invalid password");
    return res.status(401).send("Invalid user credentials");
  }

  //4. generate token

  let token = jwt.sign({ id: user.CustomerID}, dbConfig.JWT, {
    expiresIn: "60 minutes",
  });
  // console.log("token", token);

  //5. save token in DB and send response

  let setTokenQuery = `UPDATE Customers
  SET token = '${token}'
  WHERE CustomerID = ${user.CustomerID}`;

  try {
    await db.executeQuery(setTokenQuery);

    res.status(200).send({
      token: token,
      user: {
        FirstName: user.LastName,
        LastName: user.FistName,
        Email: user.Email,
        CustomerID: user.CustomerID,
      },
    });
  } catch (myError) {
    console.log("error in setting user token", myError);
    res.status(500).send();
  }
});

app.post("/customers", async (req, res)=> {

    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;
  
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send("Bad request");
    }
  
    firstName = firstName.replace("'", "''");
    lastName = lastName.replace("'", "''");
  
    let emailCheckQuery = `SELECT email
  FROM customers
  WHERE email = '${email}'`;
  
    let existingUser = await db.executeQuery(emailCheckQuery);
  
    // console.log("existing user", existingUser);
  
    if (existingUser[0]) {
      return res.status(409).send("Duplicate email");
    }
  
    let hashedPassword = bcrypt.hashSync(password);
  
    let insertQuery = `INSERT INTO customers(FirstName, LastName, Email, Password)
  VALUES('${firstName}','${lastName}','${email}','${hashedPassword}')`;
  
    db.executeQuery(insertQuery)
      .then(() => {
        res.status(201).send();
      })
      .catch((err) => {
        console.log("error in POST /customers", err);
        res.status(500).send();
      });
   
})
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
        console.log("Error in /Books/:id", err);
        res.status(500).send();
      });
    })

    app.post("/checkouts", auth,async (req, res)=>{
      try{
        let bookID = req.body.bookID;
        let checkoutDate = req.body.checkoutDate;
        let returnDate = req.body.returnDate;
      
        if(!bookID || !checkoutDate|| !returnDate || isValidDate(checkoutDate)==false){return res.status(400).send("bad request")};
      
        
      
        // console.log("summary", summary);
        // console.log("here is the contact", req.contact);
      
        let insertQuery = `INSERT INTO Checkout(BookID, CheckoutDate, ReturnDate, CustomerID)
        OUTPUT inserted.CheckoutID, inserted.CheckoutDate, inserted.ReturnDate, inserted.BookID
        VALUES('${bookID}', '${checkoutDate}', '${returnDate}', ${req.customer.CustomerID})`;
      
        let insertedReview = await db.executeQuery(insertQuery);
        // console.log("inserted review", insertedReview);
        // res.send("here is the repsonse");
        res.status(201).send(insertedReview[0]);
      }
      catch(err){
        res.status(500).send();
      }
      })
      
      app.get("/checkouts/me", auth,async (req, res)=>{
        let query = `SELECT Checkout.CheckoutID, Checkout.CheckoutDate, Checkout.ReturnDate, Book.BookID, Book.Title
        From Checkout
        INNER JOIN Customers on Checkout.CustomerID = Customers.CustomerID
        INNER JOIN Book on Checkout.BookID = Book.BookID
        WHERE Checkout.CustomerID = ${req.customer.CustomerID}`
      
        db.executeQuery(query)
        
    .then((theResults)=>{
      res.status(200).send(theResults)
  })
  .catch((myError)=>{
      res.status(500).send();
  });
       
      })
      app.get("/checkouts", auth,async (req, res)=>{
        let query = `SELECT TOP(10) Checkout.CheckoutID, Checkout.CheckoutDate, Checkout.ReturnDate, Book.BookID, Book.Title
        From Checkout
        INNER JOIN Customers on Checkout.CustomerID = Customers.CustomerID
        INNER JOIN Book on Checkout.BookID = Book.BookID
        `
      
        db.executeQuery(query)
        
    .then((theResults)=>{
      res.status(200).send(theResults)
  })
  .catch((myError)=>{
      res.status(500).send();
  });
       
      })
      
      
      
      

      function isValidDate(dateString) {
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!dateString.match(regEx)) return false;  // Invalid format
        var d = new Date(dateString);
        var dNum = d.getTime();
        if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
        return d.toISOString().slice(0,10) === dateString;
      }
      