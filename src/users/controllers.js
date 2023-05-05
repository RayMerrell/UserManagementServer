const jwt = require("jsonwebtoken");
const User = require("./models");

const registerUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    if (!newUser.id) res.status(501).json({ error: "Cannot add user" });
    //setup req object for login fuction
    req.ourUser = newUser;
    req.ourUser.passed = true;
    login(req, res);

    // const response = {
    //   Result: "New user added",
    //   ["New User"]: {
    //     id: newUser.id,
     //    userName: newUser.userName,
    //     password: newUser.password,
    //     administrator: newUser.administrator,
    //  },
    // };
    // res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};

const login = async (req, res) => {
  try {
    //check for authenticated token route
    console.log("Authenticated user found");
    if (req.authenticatedUser) {
      res.status(200).json({
        message: "Success",
        user: {
          id:req.authenticatedUser.id,
          userName: req.authenticatedUser.userName,
          administrator: req.authenticatedUser.administrator,
          token: req.header("Authorization").replace("Bearer ", ""),
        },
      });
      return;
    }
    //check the resut of password match route
    if (!req.ourUser.passed) throw new Error("User data incorrect");
    console.log("user passed", req.url);

    
    let message ="";
    let statusCode = 0;
    //one last check to see if we have just registered a new user before generating appropriate response
      if (req.url === "/users/register"){
        message ="User registered and logged in";
        statusCode=201;
      }else{
        message="User logged in";
        statusCode=200;
      }
    //generate a token for the persistance cookie
    const token = jwt.sign({ id: req.ourUser.id }, process.env.SECRET_KEY);
    //send response
    res.status(200).json({
      result: message,
      user: {
        id:req.ourUser.id,
        userName: req.ourUser.userName,
        administrator: req.ourUser.administrator,
        token: token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};

const getUserData = async (req, res) => {
  console.log("getUserData", req.params);
  //data will arrive after authentication check, so check that and only proceed if successful
  try {
    if (!req.permissionsCheck) {
      throw new Error("Not authorised");
    }
    if (!req.params.id) throw new Error("Malformed Request");

    //we are authorised, so get data and pass to client
    const userRequested = await User.findOne({
      where: { id: req.params.id },
    });
    if (!userRequested) throw new Error("User not found");
    res.status(200).json({
      result: "Success",
      user: userRequested,
    });
  } catch (error) {
    console.error("Error", error);
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};

const updateUser = async (req, res) => {
  try {
    console.log("updateUser");
    //data will arrive after authentication check, so check that and only proceed if successful
    if (!req.permissionsCheck) {
      throw new Error("Not authorised");
    }
    
    if (!req.body.userName || !req.body.requestedUser)
      throw new Error({ message: "Malformed Request" });
      let updateRequest={};
      if (req.body.userName) updateRequest.userName = req.body.userName;
      req.body.administrator?updateRequest.administrator=true:updateRequest.administrator=false;
      if (req.body.password) updateRequest.password=req.body.password;

    const updateResult = await User.update(updateRequest,
      { where: { id: req.body.requestedUser } }
    );
    if (updateResult > 0) {
      res.status(200).json({ result: "success", recordsUpdated: updateResult });
    } else {
      res.status(501).json({ result: "Record not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};
const deleteUser = async (req, res) => {
  try {
    console.log("delete user");
    //data will arrive after authentication check, so check that and only proceed if successful
    if (!req.permissionsCheck) {
      throw new Error("Not authorised");
    }
    if (!req.body.id) throw new Error("Malformed Request");

    const deleteResult = await User.destroy({
      where: { id: req.body.id },
    });
    if (deleteResult > 0) {
      res
        .status(200)
        .json({ result: "Sucessful deletion", recordsDeleted: deleteResult });
    } else {
      res
        .status(501)
        .json({ result: "Record not found", recordsDeleted: deleteResult });
    }
  } catch (error) {
    console.error(error);
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};
const getUserList = async (req, res) => {
  try {
    //data will arrive after authentication check, so check that and only proceed if successful
    if (!req.permissionsCheck) {
      throw new Error("Not authorised");
    }
    //good to go, so get the data
    userList = await User.findAll();
    //check for weirdness
    if (!userList) throw new Error ("Database communication or no users present error");
    //got data, send to client
    
    res.status(200).json({ result: "Success", ["List of users"]: userList });
  } catch (error) {
    console.error(error);
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};

module.exports = {
  registerUser,
  login,
  getUserData,
  updateUser,
  deleteUser,
  getUserList,
};
