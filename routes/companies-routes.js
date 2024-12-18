const express = require("express");
const router = express.Router();
const companiesController = require("../controllers/companies-controller");
const middlewares = require("../utils/middlewares");

router.get("/companies/get-companies", middlewares.checkPermissions({level: 3}), companiesController.getCompanies);
router.put("/companies/asing-company", middlewares.checkPermissions({level: 3}), companiesController.asignCompany);
router.post("/companies/create", middlewares.checkPermissions({level: 3}), companiesController.create);
router.put("/companies/update-self", middlewares.checkPermissions({level: 2}), companiesController.updateSelf);
router.delete("/companies/delete-self", middlewares.checkPermissions({level: 2}), companiesController.deleteSelf);

module.exports = router;