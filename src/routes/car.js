
const express = require('express');

const carController = require('../controllers/carController');
const { body } = require('express-validator');

const router = express.Router();


router.get('/', carController.getCarsController);

router.get('/:id', carController.getCarByIdController);

router.post('/', [
    body('brand').isString().notEmpty(),
    body('model').isString().notEmpty(),
    body('year').isInt().notEmpty(),
    body('color').isString().notEmpty().isLength({ min: 6, max: 6 }),
    body('carType').isString().notEmpty(),
    body('carType').isIn(['SEDAN', 'HATCHBACK', 'SUV', 'COUPE', 'CONVERTIBLE', 'WAGON', 'VAN', 'MINIVAN', 'JEEP', 'OTHER']),
    body('fuelType').isString().notEmpty(),
    body('fuelType').isIn(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'OTHER']),
    body('fuelCapacity').isInt().notEmpty(),
    body('fuelEfficiency').isInt().notEmpty(),
    body('gearType').isString().notEmpty(),
    body('gearType').isIn(['AUTO', 'MANUAL']),
    body('breakType').isString().notEmpty(),
    body('breakType').isIn(['DISC', 'DRUM', 'HYDRAULIC', 'ANTILOCK', 'MECHANICAL', 'REGENERATIVE']),
    body('remark').isString().notEmpty(),
    body('rentPrice').isInt().notEmpty(),
    body('location').isString().notEmpty(),
    body('latitude').isFloat().notEmpty(),
    body('longitude').isFloat().notEmpty(),
    body('seats').isInt().notEmpty(),
    body('doors').isInt().notEmpty(),
    body('airCondition').isBoolean().notEmpty(),
    body('airCondition').isBoolean().notEmpty(),
    body('bluetooth').isBoolean().notEmpty(),
    body('usb').isBoolean().notEmpty(),
    body('gps').isBoolean().notEmpty(),
    body('radio').isBoolean().notEmpty(),
    body('aux').isBoolean().notEmpty(),
    body('childSeat').isBoolean().notEmpty(),
    body('registrationNumber').isString().notEmpty(),
    body('image').isString().notEmpty(),
    body('images').isString().notEmpty(),
], carController.createCarController);

module.exports = router;