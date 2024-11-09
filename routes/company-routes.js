const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company-controller");
const middlewares = require("../utils/middlewares");

router.get("/company/get-companies", middlewares.checkPermissions({level: 3}), companyController.getCompanies);
router.put("/company/asing-company", middlewares.checkPermissions({level: 3}), companyController.asignCompany);
router.post("/company/create", middlewares.checkPermissions({level: 3}), companyController.create);
router.put("/company/update-self", middlewares.checkPermissions({level: 2}), companyController.updateSelf);
router.delete("/company/delete-self", middlewares.checkPermissions({level: 2}), companyController.deleteSelf);

module.exports = router;