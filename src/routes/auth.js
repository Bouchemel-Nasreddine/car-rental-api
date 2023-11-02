const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/authController');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.post('/register',
    fileUpload.any(),
    [
        check('first_name', 'First name is required').not().isEmpty(),
        check('last_name', 'Last name is required').not().isEmpty(),
        check('email').not().isEmpty().withMessage('Email is required').isEmail().withMessage('Email must be a valid email'),
        check('phone').not().isEmpty().withMessage('Phone number is required')
            .isNumeric().withMessage('Phone number must be a number')
            .isLength({ min: 9, max: 9 }).withMessage('Phone number must have 9 digits'),
        check('country_code', 'Country code is required').not().isEmpty().isNumeric(),
        check('password').not().isEmpty().withMessage('password number is required').isLength({ min: 8, max: 24 })
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'i'
            )
            .withMessage(
                'Password must include at least one lowercase letter, one uppercase letter, one number, and one special character.'
            ),
        check('street', 'Street is required').not().isEmpty(),
        check('number', 'Number is required').not().isEmpty(),
        check('city', 'City is required').not().isEmpty(),
        check('postal_code').not().isEmpty().withMessage('Postal code is required').isNumeric().withMessage('Postal code must be a number'),
        check('country', 'Country is required').not().isEmpty(),
        check('license_number').not().isEmpty().withMessage('License number is required').isNumeric().withMessage('License number must be a number'),
        check('license_delivery_date').not().isEmpty().withMessage('License delivery date is required').isISO8601().toDate().withMessage('License delivery date must be a valid date'),
        check('license_expiration_date').not().isEmpty().withMessage('License expiration date is required').isISO8601().toDate().withMessage('License expiration date must be a valid date'),
        check('license').custom((value, { req }) => {
            const licenseFile = req.files.find(file => file.fieldname === 'license');
            if (!licenseFile) {
                throw new Error('License file is required');
            } else if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(licenseFile.mimetype)) {
                throw new Error('License file must be a valid image file or pdf');
            }
            return true;
        }),
        check('avatar').custom((value, { req }) => {
            const avatarFile = req.files.find(file => file.fieldname === 'avatar');
            if (!avatarFile) {
                return true;
            }
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(avatarFile.mimetype)) {
                throw new Error('Avatar file must be a valid image file');
            }
            return true;
        }
        )
    ],
    authController.register);

router.post('/login',
    [
        check('email').not().isEmpty().withMessage('Email is required').isEmail().withMessage('Email must be a valid email'),
        check('password').not().isEmpty().withMessage('password is required')
    ]
    , authController.login);

router.post('/verify-phone/:id',
    [
        check('country_code', 'Country code is required').not().isEmpty(),
        check('phone', 'Phone number is required').not().isEmpty(),
        check('phone', 'phone length msut be 9 digits without the zero or the country code').isLength({ min: 9, max: 9 })
    ]
    , authController.verifyPhone);

module.exports = router;