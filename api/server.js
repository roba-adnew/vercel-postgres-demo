const express = require('express')

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

const app = express()

async function getUsers() {
    const users = await prisma.user.findMany();
    return users
}

app.get('/',
    async (req, res) => {
        const users = await getUsers();
        res.send(`<h1>here is our one user: ${users[0].name}</h1>`)
    }
)

app.listen(3000)

module.exports = app;
