const joi = require('joi')


function creatingSchema(data) {
  return joi.object(data);
}
  

const Validate = (schma, data) => {
  const { error, value } = creatingSchema(schma).validate(data);
  if (error) return { status: false, response: error.details };
  else return { status: true, response: value };
};


module.exports = {
  Validate,
};