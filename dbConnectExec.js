
const sql = require('mssql')
const sarmenConfig = require("./config.js");
const config = {
    user: sarmenConfig.DB.user,
    password:  sarmenConfig.DB.password,
    server:   sarmenConfig.DB.server,
    database:  sarmenConfig.DB.database
} 

async function executeQuery(queryString) {
    let connection = await sql.connect(config);

    
    let result = await connection.query(queryString);
    return result.recordset
}

module.exports = {executeQuery: executeQuery}