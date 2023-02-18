const mongoose = require('mongoose');

// importing schemas to create model
const importedfaqSchema = require('../schemas/contactschema');

// Creating schema
const contactschema = mongoose.Schema(importedfaqSchema, { timestamps: true, versionKey: false });


// Creating models
const ContactModel = mongoose.model('contact', contactschema);


module.exports = {
  contact: ContactModel

}
