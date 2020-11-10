const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const server = express();
const PORT = process.env.PORT || 5000
const usersRouter = require("./users/users-router");

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use('/api', usersRouter)


server.listen(PORT, () => {
    console.log('API IS UP AND RUNNING AT ' + PORT)
})