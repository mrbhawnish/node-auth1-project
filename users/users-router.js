const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Users = require('../users/users-model.js');
const session = require('express-session');
const sessionStore = require('connect-session-knex')(session)
router.use(session({
    name: 'monkey',
    secret: 'this should come from process.env',
    cookie: { 
      maxAge: 1000 * 60, // gives cookie an expiration date 20 secs in this case
      secure: false, // in production do  true (https is a must)
      httpOnly: true, // this means the JS on the page cannot read the cookie
    },
    resave: false, // we don't want to recreate sessions that haven't changed
    saveUninitialized: false, // we don't want to persist the session 'by default' (GDPR!!!)
    store: new sessionStore({
      knex: require('../data/db-config'),
      tablename: 'sessions',
      sidfieldname: 'sid',
      createTable: true,
      clearInterval: 1000 * 60 * 60,
      })
}))




router.post('/register', async (req, res) => {
    try{
    const { username, password } = req.body;
    // do the hash, we add the hash to the db
    const hash = bcrypt.hashSync(password, 10) // 2 ^10 rounds of hashing
    // we will insert a record without the raw password
    const user = { username, password: hash, role: 2 }
    const addedUser = await Users.add(user)
    res.json(addedUser)
    }
    catch(error) {
        res.status(500).json({ message: "Something went wrong!"})
    }
    
})


router.post('/login', async (req, res) => {
    // checks wether credentials legit 
    try{
      const { username, password} = req.body;
      // 1- use the req.username to find in the db the user with said username
      const [user]  = await Users.findBy({ username: username })
      // 2- compare the bycrypt hash of the user we just pulled against req.body.password
        if(user && bcrypt.compareSync(password, user.password)){
         // 3- if user and credentials good then welcome message
         req.session.user = user
         res.json({message: `Logged in! Welcome back ${user.username}`})
        } else {
        // 4- if no user, send back a failure message
        // 5- if user  but credentials bad send packing
        res.status(401).json({message: "You shall not pass."})
        }
    }   catch(error) {
        console.log(error.message)
        res.status(500).json({ message: "Something went wrong!"})
    }
})

router.get('/users', async (req, res) => {
    // check if the user is logged in
    if(req.session && req.session.user){
        const users = await Users.find()
        res.json(users)
    } else {
        res.status(401).json({message: "You shall not pass!"})
    }

})


module.exports = router