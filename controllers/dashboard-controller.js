const utils = require("../utils/utils");

async function getHtml(req, res){
    res.status(200).render( "../views/layouts/dashboard.ejs", { title: "Dashboard", page: "../pages/dashboard-index-page.ejs" });
}

module.exports = {
    getHtml
}