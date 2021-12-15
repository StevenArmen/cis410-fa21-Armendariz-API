const sql = require('mssql')

const config = {
    user: 'csu',
    password: 'Uuxwp7Mcxo7Khy',
    server:  'cobazsqlcis410.database.windows.net',
    database: 'sarmen'
}

sql.connect(config)
.then((myConnection)=>{return myConnection.query('SELECT * FROM Book')})
.then((myData) => {
    console.log(myData)
})