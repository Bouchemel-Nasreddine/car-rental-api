
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getCarsController = async (req, res) => {
    try {
        const cars = await prisma.car.findMany();
        res.status(200).json(cars);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getCarByIdController = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid car ID' });
    }

    try {
        const car = await prisma.car.findUnique({ where: { id: parseInt(id) } });

        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        res.status(200).json(car);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createCarController = async (req, res) => {
    const { brand, model, year, color, carType, fuelType, fuelCapacity, fuelEfficiency, gearType, breakType, remark, rentPrice, location, latitude, longitude, seats, doors, airCondition, bluetooth, usb, gps, radio, aux, childSeat, registrationNumber, image, images } = req.body;

    //chek registrationNumber is unique
    try {
        const car = await prisma.car.findUnique({ where: { registrationNumber: registrationNumber } });
        if (car) {
            return res.status(400).json({ error: 'Registration number already exist' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

    try {
        const newCar = await prisma.car.create({
            data: {
                brand,
                model,
                year,
                color,
                carType,
                fuelType,
                fuelCapacity,
                fuelEfficiency,
                gearType,
                breakType,
                remark,
                rentPrice,
                location,
                latitude,
                longitude,
                seats,
                doors,
                airCondition,
                bluetooth,
                usb,
                gps,
                radio,
                aux,
                childSeat,
                registrationNumber,
                image,
                images,
            },
        });

        res.status(201).json(newCar);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }

};




module.exports = {
    getCarsController,
    getCarByIdController,
    createCarController,
};
