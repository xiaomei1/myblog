var express = require('express');
var router = express.Router();
var pagepost =require('./pagepost');
var User = require('./user');
var crypto = require('crypto');
var Post = require('./post.js');
var multer=require('multer');
var upload = multer({dest: './public/images'});
var Comment = require('./comment');


/* GET home page. */

//ping
router.get('/ping',function(req,res,next){
 res.render('ping')
});
//home
router.get('/',pagepost.home)


// login
router.get('/login', checkNotLogin);
router.get('/login', pagepost.login);
router.post('/login',checkNotLogin)
router.post('/login',pagepost.loginpost)

//post
router.get('/post',checkLogin)
router.get('/post',pagepost.post)
router.post('/post',checkLogin)
router.post('/post',pagepost.post2)

//logout
router.get('/logout',checkLogin)
router.get('/logout',pagepost.logout)

//reg
router.get('/reg', pagepost.register);

router.post('/reg',pagepost.registerpost)
//upload
router.get('/upload',checkLogin)
router.get('/upload', function (req, res) {
  res.render('upload', {
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/upload',checkLogin)
router.post('/upload', upload.fields([
    {name: 'file1'},
    {name: 'file2'},
    {name: 'file3'},
    {name: 'file4'},
    {name: 'file5'}
]), function(req, res, next){
    for(var i in req.files){
        console.log(req.files[i]);
    }
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
});

//user
router.get('/user/:name',pagepost.userName)




//userdetail
router.get('/user/:name/:day/:title',pagepost.userDetail)
//comment
router.post('/user/:name/:day/:title',pagepost.userComment)

//edit
router.get('/edit/:name/:day/:title',pagepost.edit)
router.post('/edit/:name/:day/:title',pagepost.editpost)

//remove
router.get('/remove/:name/:day/:title',pagepost.remove)

//archive
router.get('/archive',pagepost.archive)

//tags
router.get('/tags',pagepost.tags)

//tag
router.get('/tags/:tag',pagepost.tag)

//404
router.use(function(req,res){
  res.render('404')
})

function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!'); 
      res.redirect('/login');
    }
    next();
  }

function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!'); 
      res.redirect('back');
    }
    next();
  }


module.exports = router;
