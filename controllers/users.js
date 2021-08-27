const User = require('../models/user');

module.exports.register = (req, res) => {
    res.render('users/register')
};

module.exports.create = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Sanpo Trails, where we can share the trails we have blazed.');
            res.redirect('/trails');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
};

module.exports.login = (req, res) => {
    res.render('users/login')
};

module.exports.passportLogin = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo
    if (redirectUrl === '/' || redirectUrl === '/trails') {
        res.redirect('/trails')
    } else {
    // delete req.session.returnTo;
    res.redirect(redirectUrl)
    }
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/trails');
};