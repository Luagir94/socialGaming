const MongoLib = require(`../../db/index`);
const jwt = require("jsonwebtoken");
const mongo = new MongoLib();
const bcrypt = require("bcrypt");
const { validateUser, validatePassword } = require("../../utils/schemas/auth");
const { emailSenderHandler } = require("../../utils/middlewares/emailSenderHandler");
const dotenv = require('dotenv').config()
const authController = {
  login: async (req, res, next) => {
    const { userName, password } = req.body;
    const validate = await mongo.getById("users", [
      { $match: { userName, "auth.isValidated": true } },
      { $project: { auth: 1 } },
    ]);
    if (!validate) {
      res
        .status(404)
        .send( "El Usuario no esta registrado o validado." );
    } else {
      if (
        bcrypt.compareSync(password, validate.auth.password) &&
        validate.auth.user === userName
      ) {
        const isLogged = await mongo.update("users", { userName}, { 'isLogged': true })
        const data = await mongo.getById("users", [
          { $match: { userName, "auth.isValidated": true } },
          { $project: { auth: 0 } },
        ]);
        jwt.sign(
          { data },
          process.env.CLIENT_SECRET,
          { expiresIn: "7d" },
          (err, access_token) => {
            res.json({
              access_token,
            });
          }
        );
      } else {
        res.status(404).send("Usuario o password incorrectos.");
      }
    }
  },
  changePassword: async (req, res, next) => {
    const _id = req.params.idUser;
    const { email, newPassword, oldPassword } = req.body;
    const { error, value } = validatePassword(newPassword);
    if (!error) {
      const data = await mongo.getById("users", [
        { $match: { _id } }
      ]);

      if (bcrypt.compareSync(oldPassword, data.auth.password)) {
        try {
          const modifiedPass = await mongo.update("users", { _id }, { 'auth.password': bcrypt.hashSync(newPassword, 10) });
        } catch (error) {
          if (error.tipo === "db not found") {
            res.status(404).json({ error: error.message });
          } else {
            res.status(500).json({ error: error.message });
          }
        }
      } else {
        res.status(404).json('La password introducida es incorrecta.');
      }
    }
    else {
      const mensaje = error.details[0].message;
      res.status(400).send(mensaje);
    }

   

  },
  register: async (req, res, next) => {
    const { error, value } = validateUser(req.body);
    const { email, name, password, lastName, userName } = req.body;
    const emailExist = await mongo.getById("users", [
      { $match: { email} },
      { $project: { email: 1 } }
    ]);
    const userNameExist = await mongo.getById("users", [
      { $match: { userName} },
      { $project: { userName: 1 } }
    ]);
  
    if (emailExist || userNameExist) {
      if (emailExist) {
        res.status(404).send( `Ya existe el usuario : ${emailExist.email}.`)
      } else {
        res.status(404).send( `Ya existe el usuario : ${userNameExist.userName}.`)
      }
   
    } else {
      if (!error) {
        const auth = {
          user: userName,
          password: bcrypt.hashSync(password, 10),
          isValidated: false,
        };
        const userSchema = {
          name,
          lastName,
          email,
          userName,
          isLogged: false,
          auth,
          friendRequest: [],
          friends: [],
          tournaments: []

        };
        const newUser = await mongo.create("users", userSchema);
        if (newUser) {
          const token = jwt.sign(
            { newUser },
            process.env.CLIENT_SECRET,
            { expiresIn: "1h" },
          )
          const newEmail = {
            subject: "Email Validation",
            text: "Email Validation",
            html: `<h1>Hola ${userName}!</h1>
                  <p>Entre al siguiente link para validar su cuenta</p>
                  <a href="${process.env.API_URL}api/auth/validate-account?email=${email}&access_token=${token}">Validar</a>
      `,
          };
          await emailSenderHandler(email, newEmail);
          res.status(201).send(`Se ha creado el usuario exitosamente. Un mail de verificacion se ha enviado al email proporcionado.` );
        } else {
          res.status(500).send(`Ha ocurrido un error.` )
        }
      } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
      }
    }
  
  },
  validateAcc: async (req, res, next) => {
    const email = req.query.email
    const isUser = await mongo.getById("users", [
      { $match: { "email": email } },
      { $project: { _id: 0 } },
    ]);
    if (isUser) {
      const validateAccount = mongo.update('users', { email }, { 'auth.isValidated': true })

      res.status(200).send(`Cuenta Validada.`)
    }

  },
  requestPassword: async (req, res, next) => {
    const { email } = req.body
    const data = await mongo.getById("users", [
      { $match: { "email": email } }
    ])
    if (data) {
      const token = jwt.sign(
        { email },
        process.env.CLIENT_SECRET,
        { expiresIn: "1h" },
      )
      const newEmail = {
        subject: "Email Validation",
        text: "Email Validation",
        html: `<h1>Hola ${data.userName}!</h1>
              <p>Entre al siguiente link para recuperar su password</p>
              <a href="${process.env.API_URL}api/auth/password-recovery?email=${email}&recovery_token=${token}">Validar</a>
  `,
      };
      await emailSenderHandler(email, newEmail)
      res.status(200).send("Se ha mandado un mail a su casilla de correo." )
    } else {
      res.status(404).send("El email introducino no existe." )
    }
  },
  passwordRecovery: async (req, res, next) => {
    const { email, newPassword } = req.body;
    const { error, value } = validatePassword(newPassword);
    if (!error) {
      try {
          const modifiedPass = await mongo.update("users", {email}, { 'auth.password': bcrypt.hashSync(newPassword, 10) });
          res.status(200).send("Password modificada satisfactoriamente.")
        } catch (error) {
          if (error.tipo === "db not found") {
            res.status(404).json({ error: error.message });
          } else {
            res.status(500).json({ error: error.message });
          }
        }
      
    }
    else {
      const mensaje = error.details[0].message;
      res.status(400).send(mensaje);
    }
  }
};
module.exports = { authController };
