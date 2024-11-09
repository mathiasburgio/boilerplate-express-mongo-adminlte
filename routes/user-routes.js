const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const middlewares = require("../utils/middlewares");

router.get("/user", middlewares.checkPermissions({permission:"users"}), userController.getHtml);
router.get("/user/get-list", middlewares.checkPermissions({permission:"users"}), userController.getList);
router.post("/user/create", middlewares.createUserRateLimit, userController.create);
router.post("/user/create-user-and-company", middlewares.createUserRateLimit, userController.createUserAndCompany);
router.post("/user/create-child",middlewares.checkPermissions({permission:"users"}), userController.createChild);
router.put("/user/update-self", userController.updateSelf);
router.put("/user/update-child", middlewares.checkPermissions({permission:"users"}), userController.updateChild);
router.delete("/user/delete-child", middlewares.checkPermissions({permission:"users"}), userController.deleteChild);
router.post("/user/login", middlewares.loginRateLimit, userController.login);
router.post("/user/logout", userController.logout);

module.exports = router;