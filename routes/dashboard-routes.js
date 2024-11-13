const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard-controller");
const middlewares = require("../utils/middlewares");

router.get("/dashboard", middlewares.checkPermissions({level: 1}), dashboardController.getHtml);

module.exports = router;