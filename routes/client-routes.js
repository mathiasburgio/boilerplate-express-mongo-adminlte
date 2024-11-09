const express = require("express");
const router = express.Router();
const clientController = require("../controllers/client-controller");
const middlewares = require("../utils/middlewares");

router.get("/client", middlewares.checkPermissions({permission:"clients"}), clientController.getHtml);
router.get("/client/get-list", middlewares.checkPermissions({permission:"clients"}), clientController.getList);
router.post("/client/create", middlewares.checkPermissions({permission:"clients"}), clientController.create);
router.put("/client/update-one", middlewares.checkPermissions({permission:"clients"}), clientController.updateOne);
router.delete("/client/delete-one", middlewares.checkPermissions({permission:"clients"}), clientController.deleteOne);

module.exports = router;