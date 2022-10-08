const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// Save Bulk of Specific
// **************** EXAMPLE FILE FOR SPECIFIC ROUTES ************* //

module.exports = app => {
  const specific = require("../controllers/specific.controller.js");

  var router = require("express").Router();

  router.post("/save-payments",upload.single('file'), specific.savePaymentsBulk);
  router.put("/delete-project/:projectId" , specific.deleteProjectAndData);
  router.get("/main-view-project-data" , specific.getMainViewProjectData);

  app.use('/api/specific', router);
};