const { DataTypes}=require("sequelize");
const connection = require("../db/connection");

const User = connection.define("User",
{
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT,
    unique: true,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  administrator:{
    type:DataTypes.BOOLEAN,
    allowNull:false,
    defaultValue:false
  }
},
{ indexes: [{ unique: true, fields:["userName"] }] }
);

module.exports=User
