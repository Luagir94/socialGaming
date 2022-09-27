const Joi = require('joi')
const { validate } = require('uuid')


const validateUser = (data) => {
    const schema = Joi.object({
        name : Joi.string().min(2).trim(true).required().messages({
            'string.base': `El nombre debe ser un texto`,
            'string.empty': `El campo nombre es requerido`,
            'string.min': `El nombre  debe tener un minimo de 2 caracteres.`,
            'any.required': `El campo nombre nombre es requerido`
          }),
        lastName : Joi.string().min(2).trim(true).required().messages({
            'string.base': `El apellido debe ser un texto`,
            'string.empty': `El campo apellido es requerido`,
            'string.min': `El apellido debe tener un minimo de 2 caracteres.`,
            'any.required': `El campo apellido apellido es requerido`
          }),
        email : Joi.string().email().trim(true).required().messages({
            'string.base': `El email debe ser un texto`,
            'string.empty': `El campo email es requerido`,
            'string.email': `No es un formato de email valido.`,
            'any.required': `El campo email es requerido`
          }),
        password : Joi.string().min(6).trim(true).required().messages({
            'string.base': `La password debe ser un texto`,
            'string.empty': `El campo password es requerido`,
            'string.min': `El campo password debe tener un minimo de 6 caracteres.`,
            'any.required': `El campo password es requerido`
          }),
          userName : Joi.string().min(6).trim(true).required().messages({
            'string.base': `La Usuario debe ser un texto`,
            'string.empty': `El campo Usuario es requerido`,
            'string.min': `El campo Usuario debe tener un minimo de 6 caracteres.`,
            'any.required': `El campo Usuario es requerido`
          })

    })
    return (schema.validate({ name: data.name, lastName: data.lastName,email: data.email, password : data.password, userName : data.userName}))
}
const validateUserMod = (data) => {
    const schema = Joi.object({
        name : Joi.string().min(2).trim(true).required(),
        lastName : Joi.string().min(2).trim(true).required(),
        email : Joi.string().email().trim(true).required(),
        password : Joi.string().min(6).trim(true).required()

    })
    return (schema.validate({ name: data.name, lastName: data.lastName,email: data.email,  password : data.password}))
}
const validatePassword = (data) => {
    const schema = Joi.object({
        password : Joi.string().min(6).trim(true).messages({
            'string.base': `La password debe ser un texto`,
            'string.min': `El campo password debe tener un minimo de 6 caracteres.`,
            'string.empty': `El campo password es requerido`,
            'any.required': `El campo password es requerido`,
            
          })
    })
    return (schema.validate({ password: data.password}))
}

module.exports ={
    validateUser,
    validatePassword
}