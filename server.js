const express = require('express')
const cors = require('cors')

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

const app = express()
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:4000',
    credentials: true
}))

async function getUsers() {
    const users = await prisma.user.findMany();
    return users
}

app.get('/',
    async (req, res, next) => {
        const users = await getUsers();
        res.send(`<h1>here are the users: ${users[0].email}</h1>`)
    }
)

app.listen(3000)

module.exports = app;
