
const { verifyToken, getTokenFromHeaders } = require('../utils/tokenUtils');
const { sendEmail } = require('../utils/emailUtils');

const PrismaClient = require('@prisma/client').PrismaClient;
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const getProfileController = async (req, res) => {
    const token = verifyToken(getTokenFromHeaders(req.headers));

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }


    try {
        const user = await prisma.user.findUnique({
            where: {
                credentialId: token.id,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const license = await prisma.Document.findUnique({
            where: {
                id: user.licenseId,
            },
        });

        if (!license) {
            return res.status(500).json({ message: 'Something went wrong' });
        }

        const response = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            license: {
                id: license.id,
                type: license.type,
                number: license.number,
                expirationDate: license.validUntil.toISOString().split('T')[0],
                deliveryDate: license.deliveredAt.toISOString().split('T')[0],
                file: license.file,
            },
            avatar: user.avatar,
            profileVerified: user.profileVerified,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
        }

        return res.json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }

};

const updateProfileController = async (req, res) => {

    const token = verifyToken(getTokenFromHeaders(req.headers));

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = validationResult(req);

    if (!result.isEmpty()) {
        let errors = [];
        result.array().forEach(error => {
            errors.push(error.msg);
        });
        return res.status(422).json({ message: errors });
    }

    const { email, country_code, phone, street, city, state, postal_code, country } = req.body;

    console.log("body: ", req.body)
    console.log("files: ", req.files)
    console.log("file:", req.file)

    if (!email && !country_code && !phone && !street && !city && !state && !postal_code && !country && !req.files[0]) {
        return res.status(400).json({ message: 'Nothing to update' });
    } else if (!phone && country_code || phone && !country_code) {
        return res.status(400).json({ message: 'Country code and phone number must be both present or both absent' });
    }
    // now we check that street, city, state, zipCode, country are all present or all absent
    else if (!((street && city && state && postal_code && country) || (!street && !city && !state && !postal_code && !country))) {
        return res.status(400).json({ message: 'Address ( street, city, state, postal_code, country  ) must be all present or all absent' });
    }

    const fieldsToUpdate = {};

    if (email) {
        fieldsToUpdate.email = email;
    }

    if (country_code && phone) {
        fieldsToUpdate.countryCode = country_code;
        fieldsToUpdate.phone = phone;
    }

    if (street && city && state && postal_code && country) {
        fieldsToUpdate.street = street;
        fieldsToUpdate.city = city;
        fieldsToUpdate.state = state;
        fieldsToUpdate.postalCode = postal_code;
        fieldsToUpdate.country = country;
    }

    if (req.files[0]) {
        fieldsToUpdate.avatar = process.env.SELF_URL + req.files[0].path;
    }

    console.log("fieldsToUpdate: ", fieldsToUpdate)

    try {
        const updatedUser = await prisma.user.update({
            where: {
                credentialId: token.id,
            },
            data: fieldsToUpdate,
        });

        if (!updatedUser) {
            return res.status(500).json({ message: 'Something went wrong' });
        }

        return res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }


}

const updatePasswordController = async (req, res) => {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        let errors = [];
        result.array().forEach(error => {
            errors.push(error.msg);
        });
        return res.status(422).json({ message: errors });
    }

    const token = verifyToken(getTokenFromHeaders(req.headers));

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { password, old_password } = req.body;

    try {

        // check if old password is correct
        const cred = await prisma.credential.findUnique({
            where: {
                id: token.id,
            },
        });

        if (!cred) {
            return res.status(401).json({ message: 'Unauthorized' });
        } else if (!bcrypt.compareSync(old_password, cred.password)) {
            return res.status(406).json({ message: 'wrong password' });
        } else if ((await bcrypt.compare(password, cred.password))) {
            return res.status(409).json({ message: 'new password must be different from old password' });
        } else {
            const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

            const updatedUser = await prisma.credential.update({
                where: {
                    id: token.id,
                },
                data: {
                    password: hashedPassword,
                },
            });

            if (!updatedUser) {
                return res.status(500).json({ message: 'Something went wrong' });
            }

            return res.json({ message: 'Password updated successfully' });
        }

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }



};

const deleteProfileController = async (req, res) => {

    const token = verifyToken(getTokenFromHeaders(req.headers));

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const deletedCredential = await prisma.credential.delete({
            where: {
                id: token.id,
            },
        });

        if (!deletedCredential) {
            return res.status(500).json({ message: 'Something went wrong' });
        }

        const deletedUser = await prisma.user.delete({
            where: {
                credentialId: token.id,
            },
        });

        if (!deletedUser) {
            return res.status(500).json({ message: 'Something went wrong' });
        }

        await res.json({ message: 'Profile deleted successfully' });
        await sendEmail(deletedUser.email, 'Confirmation of profile deletion', 'Your profile has been deleted');
        return;
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }

}


module.exports = {
    getProfileController,
    updateProfileController,
    updatePasswordController,
    deleteProfileController,
};