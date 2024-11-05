const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

/* router.get("/user/create", (),(req, res)=>{

}) */

router.get("/users/getList", userController.logout);
router.get("/users/create", userController.create);
router.get("/users/updatePermissions", userController.updatePermissions);
router.get("/users/updatePassword", userController.updatePassword);
router.get("/users/remove", userController.remove);
router.get("/users/login", userController.login);
router.get("/users/logout", userController.logout);

module.exports = router;