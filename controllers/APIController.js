const APIModel = require("../models/Api");

module.exports = class API {
  static APICriar(req, res) {
    res.render("users/criar");
  }
  static dashboard(req, res) {
    res.render("dashboard/dash");
  }
};
