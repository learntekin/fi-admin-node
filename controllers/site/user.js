const express = require('express');
const nodemailer=require("nodemailer");
const Router = express.Router();
const DB = require('../../models/db');
const HELPERFUNC = require('../../models/commonfunctions');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')

Router.post('/register', function (req, res) {
  const response = {
    status: 0,
    message: 'Something went wrong in your code!'
  }
  req.checkBody('name', 'name is required.').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(422).json({ errors: errors });
  }
  const name = req.body.name;
  const email = req.body.email;
  const mobile = req.body.mobile;
  const password = req.body.password;
  var encryptedPassword = bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);

  const registerFormData = {
    name: HELPERFUNC.Capitalize(name),
    email: email,
    password: encryptedPassword,
    mobile: mobile
  }

  if (!req.body.id) {
    DB.GetOneDocument('user', { email: email }, {}, {}, function (err, result) {
      if (result) {
        response.status = 0;
        response.message = 'User already exist!';
        res.send(response);
      } else {
        DB.InsertDocument('user', registerFormData, function (err, result1) {
          if (err) {
            res.send(response);
          } else {
            let mailTransporter=nodemailer.createTransport({
              service:'gmail',
              auth:{
                user:'xyz@gmail.com',
                pass:'xyz@1234'
              }
            })
            DB.GetOneDocument('newsletter',{name:"Welcome"},{},{},function(err,result1){
              if(err){
                res.send(response)
              }else{
                var template=result1.template;
                var message=template.replace(/<[>]+>/,'');
                var finalMessage=message.replace("#name",name);
                var subject=result1.subject
                var replaceSubject=subject.replace("#name",name);
                let mailDetails={
                  from:'vignesh23.developer@gmail.com',
                  to:email,
                  subject:replaceSubject,
                  text:finalMessage
                };
                const loginInfo={
                  email:email,
                  password:password
                }
                var privateKey="ecomm@123"
                var token=jwt.sign({
                  data:loginInfo
                },privateKey,{expiresIn:'1h'});
                mailTransporter.sendMail(mailDetails,function(err,data){
                  if(err){
                    res.send(err)
                  }else{
                    response.status = 1;
                    response.message = 'User registered successfully';
                    response.id = result1._id;
                    response.token = token;
                    res.send(response);
                  }
                })
              }
            })
          }
        });
      }
    });
  }
})

Router.get('/listUsers', function (req, res) {
  const response = {
    status: 0,
  }
  DB.GetDocument('user', {}, {}, {}, function (err, result) {
    if (err) {
      res.send(response);
    } else {
      response.status = 1;
      response.data = result;
      response.count = result.length;
      res.send(response);
    }
  });
});

Router.post('/login',function(req,res) {
  var response = {
      status: 0,
      message: "Something error occured"
  }
  var email = req.body.email;
  var password = req.body.password;

  DB.GetOneDocument('user',{email:email}, {}, {}, function(err, result){
      if(err) {
          res.send(response);
      } else {
          if(result==null){
              response.message = "Invalid email"
              res.send(response)
          }
          else{
              var encryptedPassword = result.password;
              bcrypt.compare(password,encryptedPassword,function(err, result1){
                  if(result1){
                      var privateKey = "ecommsite";
                      var data = {
                          email:email,
                          password: password
                      }
                      var token = jwt.sign({
                          data
                        }, privateKey, { expiresIn: '1h' });
                        response.status = 1;
                        response.message = "Success";
                        response.token = token;
                        res.send(response)
                  }
                  else{
                      response.message = "Invalid password";
                      res.send(response)
                  }
              })
          }
      }
  });
});


Router.post('/viewUser',function(req,res) {
  const response = {

  }
  DB.GetOneDocument('User',{_id:req.body.id}, {}, {}, function(err, result) {
      if(err) {
          res.send(response);
      } else {
        response.name= result.name;
        response.email=result.email;
        response.mobile=result.mobile;
        response.id=result.id;
          res.send(response);
      }
  });
});
module.exports = Router;
