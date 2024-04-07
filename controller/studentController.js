const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const student = require("../model/student");
const JobApplication = require('../model/JobApplication');
const jwt = require("jsonwebtoken");
require("dotenv").config();

//suignup route handler

//----------------------------------------------------------------------------------------------------------------

exports.register= async(req,res) => {
    try{
        const {
            name,
            email,
            password,
            dob,
            div,
            year
            // resume,
        } = req.body;
        const existingStudent = await student.findOne({email});
        if(existingStudent){
            return res.status(400).json({
                success:false, 
                message:'Student already Exists',
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
        const Student = await student.create({
            name,
            email,
            password:hashedPassword,
            dob,
            div,
            year
        //     resume,
        //     profilePicture: req.file ? req.file.path : null // Store the file path of the uploaded profile picture
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
            message:'Student cannot be created',
        });

    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

//login 
exports.login = async(req,res )=>{
    try{
        //data fetch
        const {email,password}= req.body;
        //validation on email and password
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'please fill all the details carefully',
            });

        }
        let Student = await student.findOne({email});
        //if not registered user
        if(!Student){
            return res.status(401).json({
                success:false,
                message:'Student is not registered',
            });
        }
        const payload ={
            email:Student.email,
            id:Student._id,
            role:Student.role,
        };
        //verifying password & generate a jwt token
        if(await bcrypt.compare(password,Student.password)){
            //password match 
            let token =jwt.sign(payload,
                                process.env.JWT_SECRET,
                                {
                                    expiresIn:"2h",
                                });
            Student = Student.toObject();
            Student.token = token;
            Student.password = undefined; 
            const options={
                expires:new Date(Date.now()+3000),
                httpOnly:true,
            }

            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                Student,
                message:'user login successfully',
            });

        }
        else{
            //password do not match 
            return res.status(403).json({
                success:false,
                message:"Password Incorrect",
            });
        }



    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:'Student login  failure',
            
        });
    }
};

//-------------------------------------------------------------------------------------------------------------------

// Controller for fetching all job applications
exports.getAllJobApplications = async (req, res) => {
  try {
    const jobApplications = await JobApplication.find();

    res.status(200).json(jobApplications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//------------------------------------------------------------------------------------------------------------------------

// Controller for applying to a job application
exports.applyToJobApplication = async (req, res) => {
  try {
    const { studentId, jobId } = req.params;

    // Find the student by ID
    const Student = await student.findById(studentId);

    if (!Student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the job application by ID
    const jobApplication = await JobApplication.findById(jobId);

    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    // Add student to the list of applicants
    if (!jobApplication.applicants.includes(studentId)) {
      jobApplication.applicants.push(studentId);
      await jobApplication.save();
    }

    res.status(200).json({ message: 'Applied to job application successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//----------------------------------------------------------------------------------------------------------------

// Controller for students to update their details
exports.updateStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { name, email,  dob , div, year } = req.body;

        // Check if the provided studentId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid studentId' });
        }

        // Find the student by ID and update their details
        const updatedStudent = await student.findByIdAndUpdate(studentId, { name, email, dob , div, year  }, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student details updated successfully', student: updatedStudent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

  