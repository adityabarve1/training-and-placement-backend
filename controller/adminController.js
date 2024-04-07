const bcrypt = require("bcrypt");
const mongoose = require('mongoose');

const admin = require("../model/admin");
const company = require("../model/company");
const Student = require('../model/student');
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');
require("dotenv").config();

//------------------------------------------------------------------------------------------------
exports.Adminregister= async(req,res) => {
  try{
      const {
          name,
          email,
          password
      } = req.body;
      const existingAdmin = await admin.findOne({email});
      if(existingAdmin){
          return res.status(400).json({
              success:false, 
              message:'Admin already Exists',
          });
      }

      //secur Password
      let hashedPassword;
      try {
          hashedPassword = await bcrypt.hash(password, 10);
      } 
      catch (error) {
          return res.status(500).json({
          success: false,
          message: 'Error in hashing Password',
          });
      }

      //create entry for user
      const Admin = await admin.create({
          name,
          email,
          password:hashedPassword
       })
      return res.status(200).json({
          success:true,
          message:'User Added succesfully',
      });
  }
  catch(error){
      console.log(error);
      return res.status(400).json({
          success:false,
          message:'Admin cannot be created',
      });

  }
};



//-------------------------------------------------------------------------------------------------------
//login 
exports.login = async(req,res )=>{
  try {
    const { email, password } = req.body;

    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please fill in all the details' });
    }

    // Find admin by email
    const adminUser = await admin.findOne({ email });

    // If admin not found
    if (!adminUser) {
        return res.status(401).json({ success: false, message: 'User is not registered' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, adminUser.password);
    if (!passwordMatch) {
        return res.status(403).json({ success: false, message: 'Incorrect password' });
    }

    // Generate JWT token
    const payload = {
        email: adminUser.email,
        id: adminUser._id
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    // Remove password from the admin object
    adminUser.password = undefined;

    // Set JWT token in cookie
    res.cookie('token', token, {
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // Enable secure flag in production
    });

    // Send success response
    res.status(200).json({ success: true, token, admin: adminUser, message: 'Admin login successful' });
} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
}
};

//-------------------------------------------------------------------------------//

// Controller for creating a new company
exports.createCompany = async (req, res) => {
  try{
    const {
        name,
        email,
        password
    } = req.body;
    const existingCompany = await company.findOne({email});
    if(existingCompany){
        return res.status(400).json({
            success:false, 
            message:'company already Exists',
        });
    }

    //secur Password
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 10);
    } 
    catch (error) {
        return res.status(500).json({
        success: false,
        message: 'Error in hashing Password',
        });
    }

    //create entry for user
    const Company = await company.create({
        name,
        email,
        password:hashedPassword
     })
    return res.status(200).json({
        success:true,
        message:'User Added succesfully',
    });
}
catch(error){
    console.log(error);
    return res.status(400).json({
        success:false,
        message:'Company cannot be created',
    });

}
};
//-------------------------------------------------------------------------------------

// Controller for retrieving all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await company.find({}, 'name email');

    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
//-------------------------------------------------------------------------------------

// Controller for retrieving a single company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params; // Use correct case for companyId

    // Check if companyId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }

    // Use the correct variable name for the result of findById
    const Company = await company.findById(companyId);

    // Check if company is not found
    if (!Company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Extract only the name and email fields from the company object
    const { name, email } = Company.toObject();

    // Company found, return only name and email in the response
    res.status(200).json({ name, email });
  } catch (error) {
    // Handle database query errors
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
//------------------------------------------------------------------------------------------------------

// Controller for updating a company by ID
exports.updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, email } = req.body;

    // Check if companyId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }

    // Find the company by ID and update its details
    const updatedCompany = await company.findByIdAndUpdate(companyId, { name, email }, { new: true });

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Company updated successfully', company: updatedCompany });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//-----------------------------------------------------------------------------------------------------

// Controller for deleting a company by ID
exports.deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Find the company by ID and delete it
    const deletedCompany = await company.findByIdAndDelete(companyId);

    if (!deletedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Company deleted successfully', company: deletedCompany });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//-----------------------------------------------------------------------------------------------------------

// Controller for admin to view student details by student ID
exports.getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find the student by ID
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//-----------------------------------------------------------------------------------------------------

// Controller for admin to view all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//----------------------------------------------------------------------------------------------------------------------

// Controller for admin to update student details by student ID
exports.updateStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email,  dob , div, year  } = req.body;

    // Find the student by ID and update its details
    const updatedStudent = await Student.findByIdAndUpdate(studentId, { name, email,  dob , div, year }, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student details updated successfully', student: updatedStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};