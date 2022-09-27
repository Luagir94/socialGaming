const Joi = require('joi')
const validateTournament = (data) => {
    const schema = Joi.object({
        tournamentName : Joi.string().min(8).trim(true).required().messages({
            'string.base': `El nombre debe ser un texto.`,
            'string.empty': `El campo nombre es requerido.`,
            'string.min': `El nombre del torneo debe tener un minimo de 8 caracteres.`,
            'any.required': `El campo nombre nombre es requerido`
          }),

    })
    return (schema.validate({ tournamentName: data}))
}
module.exports = {validateTournament}