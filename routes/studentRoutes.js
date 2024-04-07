const express = require("express");
const router = express.Router();

const studentController = require('../controller/studentController');

router.get('/studentLogin',studentController.login);
router.post('/student-register',studentController.register);
router.put('/stuent-update/:studentId',studentController.updateStudentDetails);
router.put('/apply/:studentId/:jobId',studentController.applyToJobApplication);
router.get('/job-applications',studentController.getAllJobApplications);


module.exports = router;
