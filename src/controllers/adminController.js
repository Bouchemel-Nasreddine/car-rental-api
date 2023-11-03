
const { verifyToken, getTokenFromHeaders, getUpdatedAdminToken } = require('../utils/tokenUtils');

const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { parse } = require('path');
const PrismaClient = require('@prisma/client').PrismaClient;

const prisma = new PrismaClient();

const register = async (req, res) => {


    const result = validationResult(req);

    if (!result.isEmpty()) {
        let errors = [];
        result.array().forEach(error => {
            errors.push(error.msg);
        });
        return res.status(422).json({ message: errors });
    }

    const { ref_number, password } = req.body;

    try {
        //check if admin exists
        const admin = await prisma.admin.findUnique({ where: { id: ref_number } });

        if (admin) {
            return res.status(409).json({ message: 'Admin with this ref number already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

        const newAdmin = await prisma.admin.create({
            data: {
                id: ref_number,
                password: hashedPassword
            }
        });

        return res.status(201).json({ message: 'Admin created successfully', "ref_number": newAdmin.id });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }
}

const login = async (req, res) => {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        let errors = [];
        result.array().forEach(error => {
            errors.push(error.msg);
        });
        return res.status(422).json({ message: errors });
    }

    const { ref_number, password } = req.body;

    try {
        const admin = await prisma.admin.findUnique({ where: { id: ref_number } });

        if (!admin) {
            return res.status(404).json({ message: 'Invalid Inexistant admin ref number' });
        } else if (bcrypt.compareSync(password, admin.password)) {
            const token = await getUpdatedAdminToken(admin);

            return res.status(200).json({ message: 'Login successful', token });
        } else {
            return res.status(401).json({ message: 'Invalid password' });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

}

const verifyUserProfile = async (req, res) => {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        let errors = [];
        result.array().forEach(error => {
            errors.push(error.msg);
        });
        return res.status(422).json({ message: errors });
    }

    const user_id = parseInt(req.params.user_id);

    if (!user_id) {
        return res.status(422).json({ message: 'Invalid user id' });
    }


    const admin = verifyToken(getTokenFromHeaders(req.headers));

    if (!admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: user_id
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Invalid Inexistant user id' });
        } else if (user.profileVerified) {
            return res.status(409).json({ message: 'User profile already verified' });
        } else {
            await prisma.user.update({
                where: {
                    id: user_id
                },
                data: {
                    profileVerified: true
                }
            });
            return res.status(200).json({ message: 'User profile verified successfully' });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

}

module.exports = {
    register,
    login,
    verifyUserProfile
}