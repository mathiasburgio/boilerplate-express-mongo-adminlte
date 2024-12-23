const express = require("express");
const router = express.Router();
const clientsController = require("../controllers/clients-controller");
const middlewares = require("../utils/middlewares");

router.get("/clients", middlewares.checkPermissions({permission:"clients"}), clientsController.getHtml);
router.get("/clients/get-list", middlewares.checkPermissions({permission:"clients"}), clientsController.getList);
router.post("/clients/create", middlewares.checkPermissions({permission:"clients"}), clientsController.create);
router.put("/clients/update-one", middlewares.checkPermissions({permission:"clients"}), clientsController.updateOne);
router.delete("/clients/delete-one", middlewares.checkPermissions({permission:"clients"}), clientsController.deleteOne);

module.exports = router;