const bcrypt = require("bcryptjs");

let hasedPassword = bcrypt.hashSync('csu123');
console.log(hasedPassword);