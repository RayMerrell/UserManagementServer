const {Sequelize}=require("sequelize");

const connection = new Sequelize(process.env.CONNECTION);

connection.authenticate();
console.log("Database connection established");

module.exports=connection;