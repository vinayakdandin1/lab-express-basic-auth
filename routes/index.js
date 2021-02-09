const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model.js')

/* GET home page */
router.get('/', (req, res, next) => res.render('index'));

// Signup page

router.get("/signup", (req, res, next) => {
    res.render('signup.hbs')
});

router.get("/signin", (req, res, next) => {
    res.render('signin.hbs');
});

router.post('/signup', (req, res, next) => {
    const {username, password} = req.body

    // Checking if user has entered all the fields
    if(!username || !password) {
        res.render('signup', {msg: 'Please enter all fields'})
        // to stop executing code lines below
        return;
    }

    // Check if username is unique
    UserModel.findOne({username: username})
        .then((result) => {
           
            if(result) {
               res.render('signup', {msg: 'Username is already taken, please use different username'})
                return;   
            } else {
                //Creating a slat
                let salt = bcrypt.genSaltSync(10);
                //Hashing
                let hash = bcrypt.hashSync(password, salt);
                 UserModel.create({username, password: hash})
                    .then(() => {
                        res.redirect('/')
                    })
                    .catch((err) => {
                         next(err)
                    })
            }
        })
        .catch(() => {
            
        })            
})

router.post('/signin', (req, res, next) => { 
    const {username, password} = req.body
  
    UserModel.findOne({username: username})
      .then((result) => {
        // if user exists
        if(result) {
          bcrypt.compare(password, result.password)
            .then((isMatching) => {
                if(isMatching) {
                  // When the user successfully signs up
                  req.session.user = result
                  res.redirect('/profile')
                }
                else {
                  res.render("signin.hbs", {msg: "Passwords does not match"})
                }
            })
        }
        else {
          res.render('signin.hbs', {msg: 'username does not exist'})
        }
      })
      .catch((err) => {
        next(err)
      })
})

const checkLoggedInUser = (req, res, next) => {
    //console.log("I am here.. in the custom middleware");
  
    if(req.session.user) {
      next()
    } else {
      res.redirect('/signin')
    }
  }
  
  router.get('/main', checkLoggedInUser, (req, res) => {
    res.render('main.hbs')
  })

  router.get('/private', checkLoggedInUser, (req, res) => {
    res.render('private.hbs')
  })

  router.get('/profile', checkLoggedInUser, (req, res) => {
    let username = req.session.user.username
    res.render('profile.hbs', {username})
  })
  
  router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
  })

module.exports = router;
