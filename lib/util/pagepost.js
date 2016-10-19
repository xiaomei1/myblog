var express = require('express');
var User = require('./user');
var crypto = require('crypto');
var Post = require('./post.js');
var User = require('./user');
var crypto = require('crypto');
var Comment=require('./comment');

//home
module.exports.home=function(req,res,next){ 
  //判断是否是第一页，并把请求的页数转换成 number 类型
  var page = req.query.p ? parseInt(req.query.p) : 1;
  //查询并返回第 page 页的 5篇文章
  Post.getTen(null, page,function (err, posts,total) {
	    if (err) {
	      posts = [];
	    } 
	    res.render('index', {
	        user: req.session.user,
	        posts: posts,
	        page:page,
	        isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 5 + posts.length) == total,
	        success: req.flash('success').toString(),
	        error: req.flash('error').toString()
	    });
    });
}
//reg

module.exports.register=function(req,res,next)
{
    res.render('register',{
    	user: req.session.user,
	    success: req.flash('success').toString(),
	    error: req.flash('error').toString()
    });
 
}


module.exports.registerpost=function(req,res,next)
{
	var name=req.body.name,
	    password = req.body.password;
	
	  //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
	    password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
    	name:name,
	    password: password,
	    email: req.body.email
	      
	   });
	  //检查用户名是否已经存在 
	User.get(newUser.name, function (err, user) {
	    if (err) {
	        req.flash('error', err);
	        return res.redirect('/');
	    }
	    if (user) {
	        req.flash('error', '用户已存在!');
	        return res.redirect('/reg');//返回注册页
	    }
	    //如果不存在则新增用户
	    newUser.save(function (err, user) {
	        if (err) {
	        req.flash('error', err);
	        return res.redirect('/reg');//注册失败返回主册页
	        }
	        req.session.user = newUser;//用户信息存入 session
	        req.flash('success', '注册成功!');
	        res.redirect('/');//注册成功后返回主页
	    });
	});	
}

//login
module.exports.login=function(req,res,next) 
{
	res.render('login',{
		user: req.session.user,
	    success: req.flash('success').toString(),
	    error: req.flash('error').toString()});

};

module.exports.loginpost=function(req,res,next) 
{
	//生成密码的 md5 值
	var md5 = crypto.createHash('md5'),
	    password = md5.update(req.body.password).digest('hex');
	  //检查用户是否存在
	User.get(req.body.name, function (err, user) {
	   if (!user) {
	      req.flash('error', '用户不存在!'); 
	      return res.redirect('/login');//用户不存在则跳转到登录页
	    }
	    //用户名密码都匹配后，将用户信息存入 session
	    req.session.user = user;
	    req.flash('success', '登陆成功!');
	    res.redirect('/');//登陆成功后跳转到主页
	});
};
//post
module.exports.post=function(req,res,next) 
{
    res.render('post',{
   	    user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
   })
};

module.exports.post2=function(req,res,next) 
{
    var currentUser = req.session.user,
		tags = [req.body.tag1, req.body.tag2, req.body.tag3];
		
    var md5 = crypto.createHash('md5'),     
        email_MD5 = md5.update(currentUser.email.toLowerCase()).digest('hex'),   
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48",
		post = new Post(currentUser.name, head, req.body.title, tags, req.body.post);  
    post.save(function (err) {
	    if (err) {
	      req.flash('error', err); 
	      return res.redirect('/');
	    }
    req.flash('success', '发布成功!');
    res.redirect('/');//发表成功跳转到主页
    });
};




//logout
module.exports.logout=function(req,res,next) 
{
	req.session.user = null;
	req.flash('success', '登出成功!');
	res.redirect('/');//登出成功后跳转到主页

};

//username
module.exports.userName=function(req,res,next){
	var page = parseInt(req.query.p, 5) || 1;
	//检查用户是否存在
    User.get(req.params.name, function (err, user) {
	    if (!user) {
	      req.flash('error', '用户不存在!'); 
	      return res.redirect('/');//用户不存在则跳转到主页
	    }
        //查询并返回该用户的5文章
        Post.getTen(user.name, page,function (err, posts,total) {
		    if (err) {
		        req.flash('error', err); 
		        return res.redirect('/');
		    } 
	        res.render('user', {
		        posts: posts,
		        page:page,
		        isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 5 + posts.length) == total,
		        user : req.session.user,
		        success : req.flash('success').toString(),
		        error : req.flash('error').toString()
	        });
        });
    });
}


//userdetail
module.exports.userDetail=function(req,res,next){
	Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
	    if (err) {
	      req.flash('error', err); 
	      return res.redirect('/');
    }
    res.render('article', {
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
}


//edit

module.exports.edit=function(req,res,next){
	var currentUser = req.session.user;
	Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
		if (err) {
		  req.flash('error', err); 
		  return res.redirect('back');
		}
		res.render('edit', {
		  post: post,
		  user: req.session.user,
		  success: req.flash('success').toString(),
		  error: req.flash('error').toString()
		});
	});
}


module.exports.editpost=function(req,res,next){
	var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
	    var url = encodeURI('/user/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
	    if (err) {
	      req.flash('error', err); 
	      return res.redirect(url);//出错！返回文章页
	    }
	    req.flash('success', '修改成功!');
	    res.redirect(url);//成功！返回文章页
  });
}


//remove
module.exports.remove=function(req,res,next){
	var currentUser = req.session.user;
    Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
	    if (err) {
	      req.flash('error', err); 
	      return res.redirect('back');
	    }
	    req.flash('success', '删除成功!');
	    res.redirect('/');
  });
}
//usercomment
module.exports.userComment=function(req,res,next){
	var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
             date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var md5 = crypto.createHash('md5'),  
        email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),  
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";  

    var comment = {
	    name: req.body.name,
	    head:head,
	    email: req.body.email,
	    website: req.body.website,
	    time: time,
	    content: req.body.content
    };
    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
	newComment.save(function (err) {
	    if (err) {
	      req.flash('error', err); 
	      return res.redirect('back');
	    }
	    req.flash('success', '留言成功!');
	    res.redirect('back');
	    });
    }

 //archive
 module.exports.archive=function(req,res,next){
 	Post.getArchive(function (err, posts) {
	    if (err) {
	      req.flash('error', err); 
	      return res.redirect('/');
	    }
    res.render('archive', {
    
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
 }

 //tags
 module.exports.tags=function(req,res,next){
 	Post.getTags(function (err, posts) {
	    if (err) {
	      req.flash('error', err); 
	      return res.redirect('/');
	    }
    res.render('tags', {
     
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
 }
 //tag
 module.exports.tag=function(req,res,next){
 	Post.getTag(req.params.tag, function (err, posts) {
	    if (err) {
	      req.flash('error',err); 
	      return res.redirect('/');
	    }
    res.render('tag', {
      //title: 'TAG:' + req.params.tag,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

 }