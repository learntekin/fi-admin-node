const BaseUrl = '/api/v1/';
module.exports = function(app) {
  app.use(BaseUrl+"contact", require("../controllers/admin/contact"));
 
}
