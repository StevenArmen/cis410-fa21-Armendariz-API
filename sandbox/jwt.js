const jwt = require("jsonwebtoken");
let myToken = jwt.sign({pk: 233},"pssasd",{
    expiresIn: "60 minutes",
})

console.log("my Token", myToken);

let verificationTest = jwt.verify(myToken, "pssasd")

console.log("verification test", verificationTest)