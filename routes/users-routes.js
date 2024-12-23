const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users-controller");
const middlewares = require("../utils/middlewares");

router.get("/dashboard/users", middlewares.checkPermissions({permission:"users"}), usersController.getHtml);

router.get("/users/get-list", middlewares.checkPermissions({permission:"users"}), usersController.getList);
router.post("/users/create", middlewares.createUserRateLimit, usersController.create);
router.post("/users/create-user-and-company", middlewares.createUserRateLimit, usersController.createUserAndCompany);
router.post("/users/create-child",middlewares.checkPermissions({permission:"users"}), usersController.createChild);
router.put("/users/update-self", usersController.updateSelf);
router.put("/users/update-child", middlewares.checkPermissions({permission:"users"}), usersController.updateChild);
router.delete("/users/delete-child", middlewares.checkPermissions({permission:"users"}), usersController.deleteChild);
router.post("/users/login", middlewares.loginRateLimit, usersController.login);
router.get(["/users/logout", "/logout"], usersController.logout);
router.post(["/users/logout", "/logout"], usersController.logout);
router.post("/users/request-password-change", usersController.requestPasswordChange);
router.post("/users/change-password", usersController.changePassword);

module.exports = router;