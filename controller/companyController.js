const bcrypt = require("bcrypt");
const Company = require("../model/company");
const Student = require('../model/student');
const nodemailer = require("nodemailer");
const JobApplication = require('../model/JobApplication');
const jwt = require("jsonwebtoken");
require("dotenv").config();

//--------------------------------------------------------------------------------------------------------------------------
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
        let company = await Company.findOne({email});
        //if not registered user
        if(!company){
            return res.status(401).json({
                success:false,
                message:'Company is not registered',
            });
        }
        const payload ={
            email:company.email,
            id:company._id,
            role:company.role,
        };
        //verifying password & generate a jwt token
        if(await bcrypt.compare(password,company.password)){
            //password match 
            let token =jwt.sign(payload,
                                process.env.JWT_SECRET,
                                {
                                    expiresIn:"2h",
                                });
            company = company.toObject();
            company.token = token;
            company.password = undefined; 
            const options={
                expires:new Date(Date.now()+3000),
                httpOnly:true,
            }

            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                company,
                message:'Company login successfully',
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
        console.log(err);
        return res.status(400).json({
            success:false,
            message:'Admin login  failure',
            
        });
    }
}

//-----------------------------------------------------------------------------------------------------

// Controller for creating a job application
exports.createJobApplication = async (req, res) => {
  try {
    const { companyId, title, description } = req.body;

    // Create a new job application
    const jobApplication = new JobApplication({
      companyId,
      title,
      description
      // Add more fields as needed
    });

    await jobApplication.save();

    res.status(201).json({ message: 'Job application created successfully', jobApplication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//------------------------------------------------------------------------------------------------------------------

// Controller for getting all job applications
exports.getAllJobApplications = async (req, res) => {
  try {
    const jobApplications = await JobApplication.find().populate('companyId', 'name');

    res.status(200).json(jobApplications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//-------------------------------------------------------------------------------------------------------------------------------------------------

// Controller for getting job applications by company ID
exports.getJobApplicationsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
    const jobApplications = await JobApplication.find({ companyId }).populate('applicants');

    res.status(200).json(jobApplications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


  //-----------------------------------------------------------------------------------------------------------------------------
  
  // Controller for updating a job application by ID
  exports.updateJobApplication = async (req, res) => {
    try {
      const { jobId } = req.params;
      const { title, description } = req.body;
  
      // Find the job application by ID and update its details
      const updatedJobApplication = await JobApplication.findByIdAndUpdate(jobId, { title, description }, { new: true });
  
      if (!updatedJobApplication) {
        return res.status(404).json({ message: 'Job application not found' });
      }
  
      res.status(200).json({ message: 'Job application updated successfully', jobApplication: updatedJobApplication });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  //------------------------------------------------------------------------------------------------------------------------------
  
  // Controller for deleting a job application by ID
  exports.deleteJobApplication = async (req, res) => {
    try {
      const { jobId } = req.params;
  
      // Find the job application by ID and delete it
      const deletedJobApplication = await JobApplication.findByIdAndDelete(jobId);
  
      if (!deletedJobApplication) {
        return res.status(404).json({ message: 'Job application not found' });
      }
  
      res.status(200).json({ message: 'Job application deleted successfully', jobApplication: deletedJobApplication });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  //------------------------------------------------------------------------------------------------------
  // Controller to get the list of applicants for a job application
exports.getApplicantsForJobApplication = async (req, res) => {
    try {
      const { jobId } = req.params;
  
      // Find the job application by ID
      const jobApplication = await JobApplication.findById(jobId).populate('applicants');
  
      if (!jobApplication) {
        return res.status(404).json({ message: 'Job application not found' });
      }
  
      res.status(200).json(jobApplication.applicants);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  //---------------------------------------------------------------------------------------------------------
  
  // Controller to approve or reject a student's application for a job
exports.processApplication = async (req, res) => {
  try {
    const { jobId, studentId } = req.params;
    const { status } = req.body;

    // Find the job application by ID
    const jobApplication = await JobApplication.findById(jobId).populate('companyId');

    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    // Check if the student applied for the job application
    const studentIndex = jobApplication.applicants.indexOf(studentId);

    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student did not apply for this job' });
    }

    // Update the status of the student's application
    jobApplication.applicants[studentIndex].status = status;

    await jobApplication.save();

    // If the application is approved, send an email to the student
    if (status === 'approved') {
      const student = await Student.findById(studentId);

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Configure nodemailer to send the email
      const transporter = nodemailer.createTransport({
        // Configure SMTP transport
        // For example, Gmail SMTP configuration
        service: 'Gmail',
        auth: {
          user: 'sendmail8767@gmail.com',
          pass: 'zrxr huad spmv lmvt'
        }
      });

      // Email content
      const mailOptions = {
        from: 'sendmail8767@gmail.com',
        to: student.email,
        subject: 'Job Application Approved',
        text: 'Your job application has been approved. Congratulations!'
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.status(200).json({ message: 'Application processed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};