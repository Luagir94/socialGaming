const express = require('express')
const { routerAuth } = require('./routes/auth')
const { routerUser } = require('./routes/users')
const { routerTournaments } = require('./routes/tournaments')
const app = express()

const server = app.listen(process.env.PORT || 8080, () => {
    console.log(`Sv en puerto ${server.address().port}`)
})
app.use(routerAuth)
app.use(routerUser)
app.use(routerTournaments)

app.get('/api', (req, res) => {
    res.send(`Bienvenidos`)
})