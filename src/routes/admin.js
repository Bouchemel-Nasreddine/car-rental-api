const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const adminController = require('../controllers/adminController');

router.post('/register-admin',
    [
        check('ref_number', 'ref number is required').not().isEmpty(),
        check('password', 'password is required').not().isEmpty(),
        check('password', 'password must be at least 8 characters and 24 at max').isLength({ min: 8, max: 24 }),
        check('password', 'password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'i'
            )
    ]
    , adminController.register);

router.post('/login-admin', [
    check('ref_number', 'ref number is required').not().isEmpty(),
    check('password', 'password is required').not().isEmpty()
], adminController.login);

router.get('/verify-user/:user_id', adminController.verifyUserProfile);

module.exports = router;