const express = require("express");
const router = express.Router();
//const userController = require("../controllers/user-controller");

router.get("/example/dashboard", userController.logout);
router.get("/example/index2", userController.create);
router.get("/example/crud", userController.create);
router.get("/example/config", userController.create);
router.get("/example/client-crud", userController.create);
router.get("/example/user-crud", userController.create);
router.get("/example/404", userController.create);

module.exports = router;