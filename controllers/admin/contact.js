/* to use express framework - get the url - api call */
const express       = require('express');
/* to get the sequence of routing urls */
const Router        = express.Router();

const DB            = require('../../models/db');
const HELPERFUNC    = require('../../models/commonfunctions');
var mongoose        = require('mongoose');

Router.get('/listcontact',function(req,res) {
  const response = {
    status  : 0,
  }
  DB.GetDocument('contact',{}, {}, {}, function(err, result) {
      if(err) {
          res.send(response);
      } else {
          response.status  = 1;
          response.data    = result;
          response.count   = result.length;
          res.send(response);
      }
  });
});

Router.post('/viewContact',function(req,res) {
  const response = {    
  }
  DB.GetOneDocument('contact',{_id:req.body.id}, {}, {}, function(err, result) {
      if(err) {
          res.send(response);
      }
       /* to get the parameter */
      else {
          response.id=result.id;
          response.name=result.name;
          response.email=result.email;
          response.phonenumber=result.phonenumber;
          response.message=result.message;
          response.status=result.status;
          res.send(response);
      }
  });
});

Router.post('/addUpdateContact' ,function(req,res) {
  const response = {
    status  : 0,
    message : 'Something went wrong in your code!'
  }
  req.checkBody('name', 'name is required.').notEmpty();
  req.checkBody('email', 'email is required.').notEmpty();
  req.checkBody('phonenumber', 'phonenumber is required.').notEmpty();
  req.checkBody('message', 'message is required.').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.status(422).json({ errors: errors});
  }
  const name = req.body.name;
  const email   = req.body.email;
  const phonenumber   = req.body.phonenumber;
  const message   = req.body.message;
  const status   = req.body.status;

  const contactFormData = {
    name  : HELPERFUNC.Capitalize(name),
    email    : HELPERFUNC.Capitalize(email),
    phonenumber    : HELPERFUNC.Capitalize(phonenumber),
    message    : HELPERFUNC.Capitalize(message),
    status    : status
  }
  if(!req.body.id){
    DB.GetOneDocument('contact', {name : name}, {}, {}, function(err, result) {
      if(result){
        response.status  = 0;
        response.message = 'Data you have entered is already exist!';
        res.send(response);
      } else {
        DB.InsertDocument('contact', contactFormData, function(err, result1) {
      if(err) {
            res.send(response);
          } else {
            response.status  = 1;
            response.message = 'contact added successfully';
            response.id      = result1._id;
            res.send(response);
          }
        });
      }
    });
  } else {
    DB.FindUpdateDocument('contact',{_id:req.body.id}, contactFormData, function(err, result) {
      if(err) {
        res.send(response);
      } else {
        DB.GetOneDocument('contact', {_id:req.body.id}, {}, {}, function(err, result1) {
            if(err) {
                res.send(response);
            } else {
                  const contactData = {
                    id         : result1._id,
                    name   : result1.name,
                    email     : result1.email,
                    phonenumber     : result1.phonenumber,
                    message: result1.message,
                    status     : result1.status
                  }
                  response.status  = 1;
                  response.message = 'Contact updated successfully';
                  response.data    = contactData;
                res.send(response);
            }
        });
      }
    });
  }
})

Router.post('/deleteContact',function(req,res) {
  const response = {
    status  : 0,
    message : 'Something went wrong in your code!'
  }
  DB.DeleteDocument('contact', {_id:req.body.id}, function(err, result) {
      if(err) {
          res.send(response);
      } else {
        DB.GetDocument('contact', {}, {}, {}, function(err, result) {
            if(err) {
                res.send(response);
            } else {
                  response.status  = 1;
                  response.message = 'Contact deleted successfully';
                  response.data    = result;
                  response.count   = result.length;
                  res.send(response);
            }
        });
      }
  });
})

module.exports = Router;
