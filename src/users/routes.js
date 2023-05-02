const router = require("express").Router();
const {registerUser, login, getUserData, updateUser, deleteUser, getUserList} = require("./controllers");
const {hashPass, comparePass, tokenCheck, permissionsCheck }=require("../middleware/index");

router.post ("/users/register", hashPass, registerUser);
router.post ("/users/login", comparePass, login);
router.get ("/users/authCheck", tokenCheck, login);
router.get ("/users/getUserData/:id", permissionsCheck, getUserData);
router.put ("/users/updateUser", permissionsCheck, updateUser);
router.delete ("/users/deleteUser", permissionsCheck, deleteUser);
router.get("/users/getUserList", permissionsCheck, getUserList);

module.exports = router;