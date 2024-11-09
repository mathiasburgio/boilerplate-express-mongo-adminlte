const express = require("express");
const router = express.Router();
const configController = require("../controllers/config-controller");
const middlewares = require("../utils/middlewares");

router.get("/config", middlewares.checkPermissions({permission:"config"}), configController.getHtml);
router.get("/config/load-config", middlewares.checkPermissions({permission:"config"}), configController.loadConfig);
router.post("/config/save-config", middlewares.checkPermissions({permission:"config"}), configController.saveConfig);

module.exports = router;