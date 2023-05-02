require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const User = require("./users/models");
const router = require("./users/routes.js");

app.get("/health", (req, res) => res.send("I'm alive!"));

app.use(cors());
app.use(express.json());

app.use(router);

const syncTables = () => {
  User.sync({ alter: true });
};

app.listen(process.env.PORT || 5000, () => {
  syncTables();
  console.log("App listening eagerly on port", process.env.PORT || 5000);
});
