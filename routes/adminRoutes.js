const express =require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const adminController = require('../controller/adminController');
const secretKey='your_secret_key';

// Middleware to verify JWT token 
 
const verifyToken = (req, res, next) => { 
    const token = req.cookies.jwt_token; 
    if (!token) { 
        return res.status(401).json({ message: 'Unauthorized' }); 
    } 
    try{ 
        const decoded = jwt.verify(token, secretKey); 
        req.playerId = decoded.playerId; 
        next(); 
    }catch (err) { 
        return res.status(403).json({ message: 'Invalid token' }); 
    } 
};


router.post('/admin-register',adminController.Adminregister);
router.get('/adminlogin',adminController.login);
router.post('/createCompany',adminController.createCompany);
router.delete('/deleteCompany/:companyId',adminController.deleteCompany);
router.get('/getStudent-list',adminController.getAllStudents);
router.get('/allCompanies',adminController.getAllCompanies);
router.put('/updateCompany/:companyId',adminController.updateCompany);
router.get('/:companyId',adminController.getCompanyById );
router.get('/getStudentDetails/:studentId',adminController.getStudentDetails);
router.put('/update-details/:studentId',adminController.updateStudentDetails);

module.exports = router;

