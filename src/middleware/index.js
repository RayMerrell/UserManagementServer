const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../users/models");

const salt = process.env.SALT_ROUNDS;

const hashPass = async (req, res, next) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, Number(salt));
    next();
  } catch (error) {
    console.error(error);
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};
const comparePass = async (req, res, next) => {
  try {
    if (!req.body.userName || !req.body.password)
      throw new error("Malformed request");
    req.ourUser = await User.findOne({
      where: { userName: req.body.userName },
    });
    if (!req.ourUser) {
      throw new Error("Credentials Incorrect");
    }
    //use compare
    req.ourUser.passed = await bcrypt.compare(
      req.body.password,
      req.ourUser.password
    );
    next();
  } catch (error) {
    console.error(error);
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};
const tokenCheck = async (req, res, next) => {
  try {
    if (!req.header("Authorization")) {
      throw new Error("Missing Credentials");
    }
    //token arrives through the "Authorization" header prefixed by "Bearer "
    const token = req.header("Authorization").replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log("DecodedToken", decodedToken);
    //use decoded token to find a database match
    const ourUser = await User.findOne({ where: { id: decodedToken.id } });
    //no match, no authorisation
    if (!ourUser) {
      throw new Error("No authorization");
    }
    //if there is a match, add user as an authenticated user to req
    req.authenticatedUser = ourUser;
    next();
  } catch (error) {
    console.error(error);
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};
const permissionsCheck = async (req, res, next) => {
  console.log("Permissions check", req.params.id);
  //Here we will check for admin and/or whether the requested user is the same as the logged in user
  //A pass on either will result in an authentication pass
  //a request with no requested user (i.e, user list request) will fail if user is not an administrator
  //current user data is accessed through the log-in cookie passed through the Authorization header
  try {
    //first, deny ALL permissions before we check for an overide
    req.permissionsCheck = false;
    //get the current user details
    if (!req.header("Authorization")) {
      throw new Error("Missing Credentials");
    }
    const token = req.header("Authorization").replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log("decoded Token", decodedToken);
    req.currentUser = await User.findOne({
      where: { id: decodedToken.id },
    });
    //no user, abort
    if (!req.currentUser) {
      throw new Error("Incorrect Credentials");
    }
    //admin is an automatic successful return
    if (req.currentUser.administrator) {
      req.permissionsCheck = true;
      next();
      return;
    }
    //if there is no request for user details, res is unsuccessful (no admin & no match)
    //the ONLY thing a non-administrator can do is view/ammend their own user record
    //if there is a requested user check for current/requested user match and pass if there is a mtach
    if (
      req.params.id &&
      req.params.id == req.currentUser.id
    ) {
      req.permissionsCheck = true;
    }
    console.log("requestedUser", req.requestedUser, "current user", req.currentUser.id);
    if (
      req.body.requestedUser &&
      req.body.requestedUser == req.currentUser.id
    ) {
      req.permissionsCheck = true;
    }
    next();
  } catch (error) {
    console.error(
      "******************************Error trapped******************************",
      error
    );
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};

module.exports = { hashPass, comparePass, tokenCheck, permissionsCheck };
