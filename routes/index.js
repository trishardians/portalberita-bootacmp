var express = require('express');
var router = express.Router();

const db = require('../models');
const User = db.users;
const News = db.berita;
const Comment = db.comments;
const Op = db.Sequelize.Op;


var bcrypt = require('bcryptjs');

const auth = require('../auth');
const comment = require('../models/comment');

/* GET home page. */

router.get('/', function (req, res, next) {
	News.findAll()
		.then(databerita => {
			res.render('index', {
				data: databerita
			});
		})
		.catch(err => {
			res.render('index', {
				data: []
			});
		});
});

// Webpage
router.get('/daftarberita', auth, function (req, res, next) {
	News.findAll()
		.then(edit => {
			res.render('daftarberita', {
				data: edit
			});
		})
		.catch(err => {
			res.render('daftarberita', {
				data: []
			});
		});
});

//Laman Berita
router.get('/newspage', function (req, res, next) {
	var id = parseInt(req.query.id); // productdetail?id=xxx
	// query ke database
	// select * from product where id=id
	News.findByPk(id)
		.then(berita => {
			if (berita) {
				var page = berita
				Comment.findAll({ where: { newsid: id } })
					.then(data => {
						if (data) {
							res.render('newspage', {
								pop: page,
								komentar: data
							});
						} else {
							res.render('newspage', {
								pop: berita,
								komentar: data
							});
						}
					})
					.catch(err => {
						res.render('newspage', {
							pop: berita,
							komentar: {}
						});
					});
			} else {
				// http 404 not found
				res.render('newspage', {
					berita: berita,
					komentar: {}
				});
			}

		})
		.catch(err => {
			res.render('newspage', {
				berita: {},
				komentar: {}
			});
		});
});

router.post('/comment/:id', function (req, res, next) {
	var id = parseInt(req.params.id)
	var komentar = {
		newsid: id,
		comment: req.body.comment
	}
	Comment.create(komentar)
		.then(data => {
			res.redirect("/newspage?id=" + " " + id)
		})
		.catch(err => {
			res.redirect("/login")
		});

	//res.render('addproduct', { title: 'Add Product' });
});

//Addnews
router.get('/addnews', auth, function (req, res, next) {
	res.render('addnews', { title: 'Express' });
});

router.post('/addnews', auth, function (req, res, next) {

	var dataBerita = {
		urlGambar: req.body.urlGambar,
		judulBerita: req.body.judulBerita,
		isiBerita1: req.body.isiBerita1,
		isiBerita2: req.body.isiBerita2,
		isiBerita3: req.body.isiBerita3
	}
	News.create(dataBerita)
		.then(data => {
			res.redirect("/")
		})
		.catch(err => {
			res.render('addnews', {

				// ,
				// name: req.body.name,
				// quantity: req.body.quantity,
				// price: req.body.price 
			});
		});

	//res.render('addproduct', { title: 'Add Product' });
});



router.get('/editberita', auth, function (req, res, next) {
	var id = parseInt(req.query.id); // productdetail?id=xxx
	// query ke database
	// select * from product where id=id
	News.findByPk(id)
		.then(dataBerita => {
			if (dataBerita) {
				res.render('editberita', {
					data: dataBerita
				});
			} else {
				// http 404 not found
				res.render('daftarberital', {
					data: {}
				});
			}

		})
		.catch(err => {
			res.render('daftarberita', {
				data: {}
			});
		});

});


router.get('/deleteberita/:id', auth, function (req, res, next) {
	var id = parseInt(req.params.id); // /detail/2, /detail/3

	News.destroy({
		where: { id: id }
	})
		.then(num => {
			res.redirect('/daftarberita');
		})
		.catch(err => {
			res.json({
				info: "Error",
				message: err.message
			});
		});

});

router.get('/deletecomment/:id', auth, function (req, res, next) {
	var id = parseInt(req.params.id); // /detail/2, /detail/3

	Comment.destroy({
		where: { id: id }
	})
		.then(num => {
			res.redirect("/");
		})
		.catch(err => {
			res.json({
				info: "Error",
				message: err.message
			});
		});

});

router.get('/editberita/:id', auth, function (req, res, next) {
	var id = parseInt(req.params.id); // /detail/2, /detail/3
	// query ke database
	// select * from product where id=id
	News.findByPk(id)
		.then(detailBerita => {
			if (detailBerita) {
				res.render('editberita', {
					urlGambar: detailBerita.urlGambar,
					judulBerita: detailBerita.judulBerita,
					isiBerita1: detailBerita.isiBerita1,
					isiBerita2: detailBerita.isiBerita2,
					isiBerita3: detailBerita.isiBerita3
				});
			} else {
				// http 404 not found
				res.redirect('/daftarberita');
			}

		})
		.catch(err => {
			res.redirect('/daftarberita');
		});

});


router.post('/editberita/:id', auth, function (req, res, next) {
	var id = parseInt(req.params.id); // /detail/2, /detail/3

	News.update(req.body, {
		where: { id: id }
	})
		.then(num => {
			res.redirect('/daftarberita');

		})
		.catch(err => {
			res.json({
				info: "Error",
				message: err.message
			});
		});

});
router.get('/register', function (req, res, next) {
	res.render('register', {});
});
router.post('/register', function (req, res, next) {
	var hashpass = bcrypt.hashSync(req.body.password, 8);
	var user = {
		name: req.body.name,
		email: req.body.email,
		username: req.body.username,
		password: hashpass
	}
	User.findOne({ where: { email: req.body.email } })
		.then(data => {
			if (data) {
				res.redirect('/register');;
			} else {
				User.create(user)
					.then(data => {
						res.redirect('/login');;
					}).catch(err => {
						res.redirect('/register');;
					});
			}
		})
		.catch(err => {
			res.redirect('/register');
		});


	//res.render('addproduct', { title: 'Add Product' });
});

router.get('/login', function (req, res, next) {
	res.render('loginform', {});
});

router.get('/error', function (req, res, next) {
	res.render('error', {});
});

router.post('/login', function (req, res, next) {
	User.findOne({ where: { email: req.body.email } })
		.then(data => {
			console.log(loginValid);
			if (data) {
				var loginValid = bcrypt.compareSync(req.body.password, data.password);
				console.log(loginValid);
				if (loginValid) {

					// simpan session
					req.session.email = req.body.email;
					req.session.islogin = true;

					res.redirect('/daftarberita');
				} else {
					res.redirect('/');
				}
			} else {
				res.redirect('/');
			}
		})
		.catch(err => {
			res.redirect('/');
		});
});

router.get('/logout', function (req, res, next) {
	req.session.destroy();
	res.redirect('/');
});

module.exports = router;
