const express =require("express");
const router = express.Router();

const companyController = require('../controller/companyController');




router.get('/companyLogin',companyController.login);
router.post('/create-job',companyController.createJobApplication);
router.get('/job-application',companyController.getAllJobApplications);
router.get('/job-applicants/:jobId',companyController.getApplicantsForJobApplication);
router.put('/job-application/:jobId/process/:studentId',companyController.processApplication);
router.put('/job-application/:jobId',companyController.updateJobApplication);
router.delete('/job-delete-application/:jobId',companyController.deleteJobApplication);

module.exports=router;
