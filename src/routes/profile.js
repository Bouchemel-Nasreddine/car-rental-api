
const profileController = require('../controllers/profileController');
const fileUpload = require('../middleware/file-upload');

const express = require('express');
const { check } = require('express-validator');


const router = express.Router();

router.get('/', profileController.getProfileController);

router.put('/',
    fileUpload.any(),
    [
        check('email', 'email not required but if present should be valid').optional().isEmail(),
        check('phone', 'phone not required but if present should be valid').optional().isNumeric().withMessage('Phone number must be a number')
            .isLength({ min: 9, max: 9 }).withMessage('Phone number must have 9 digits'),
        check('country_code', 'Country code is required').optional().isNumeric(),

    ],
    profileController.updateProfileController);

router.put('/password',
    [
        check('password').not().isEmpty().withMessage('password number is required').isLength({ min: 8, max: 24 })
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'i'
            )
            .withMessage(
                'Password must include at least one lowercase letter, one uppercase letter, one number, and one special character.'
            ),
        check('old_password').not().isEmpty().withMessage('old password is required'),
    ],
    profileController.updatePasswordController);

router.delete('/', profileController.deleteProfileController);

module.exports = router;