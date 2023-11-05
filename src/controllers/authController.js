
const { getUpdatedToken } = require('../utils/tokenUtils');

const bcrypt = require('bcrypt');
const PrismaClient = require('@prisma/client').PrismaClient;
const { validationResult } = require('express-validator');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const { response } = require('express');

const prisma = new PrismaClient();

const verificationTokens = [];

const register = async (req, res) => {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        let errors = [];
        result.array().forEach(error => {
            errors.push(error.msg);
        });
        return res.status(422).json({ message: errors });
    }

    const { first_name, last_name, email, phone, country_code, password,
        license_number, license_delivery_date, license_expiration_date,
        street, number, city, postal_code, country } = req.body;

    //verifing if the user already exists
    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        const credentials = await prisma.Credential.findUnique({
            where: {
                email
            }
        });

        if (credentials || user) {
            return res.status(409).json({ message: 'Email already exists' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

    //verifing if the combination of country code phone number already exists
    try {
        const user = await prisma.user.findUnique({
            where: {
                User_phone_countryCode_unique: {
                    countryCode: parseInt(country_code),
                    phone: parseInt(phone)
                }
            }
        });

        if (user) {
            return res.status(409).json({ message: 'Phone number already exists' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

    //creating the adress
    let adress;
    try {
        adress = await prisma.adress.create({
            data: {
                street,
                number,
                city,
                postalCode: postal_code,
                country
            }
        });
        console.log("adress: ", adress);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

    //creating license
    let license;
    try {
        const licenseFile = req.files.find(file => file.fieldname === 'license');
        console.log("licenseFile: ", licenseFile);
        license = await prisma.document.create({
            data: {
                type: 'license',
                file: process.env.SELF_URL + licenseFile.path.replace('\\', '/').replace('\\', '/'),
                number: license_number,
                deliveredAt: license_delivery_date,
                validUntil: license_expiration_date
            }
        });
        console.log("license: ", license);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

    //getting the avatar url, if not present just put null
    let avatar;
    const avatarFile = req.files.find(file => file.fieldname === 'avatar');
    if (avatarFile) {
        avatar = process.env.SELF_URL + avatarFile.path.replace('\\', '/').replace('\\', '/');
    } else {
        avatar = null;
    }


    //hashing the password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

    //creating credentials
    let credentials;
    try {
        credentials = await prisma.Credential.create({
            data: {
                email,
                password: hashedPassword
            }
        });
        console.log("credentials: ", credentials);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

    //creating the user
    try {
        const user = await prisma.user.create({
            data: {
                firstName: first_name,
                lastName: last_name,
                email,
                phone: parseInt(phone),
                countryCode: parseInt(country_code),
                adress: adress.id,
                licenseId: license.id,
                avatar: avatar,
                Credential: {
                    connect: {
                        id: credentials.id
                    }
                }

            }
        });

        res.status(201).json({ "id": user.id, message: 'User created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
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

    const { email, password } = req.body;

    try {
        const cred = await prisma.Credential.findUnique({
            where: {
                email
            }
        });

        if (!cred) {
            return res.status(400).json({ message: 'user with this email does not exist' });
        } else {
            const isPasswordValid = await bcrypt.compare(password, cred.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid password' });
            } else {
                token = await getUpdatedToken(cred);

                const credId = parseInt(cred.id);

                try {
                    const user = await prisma.User.findUnique({
                        where: {
                            credentialId:
                                credId

                        }
                    });

                    return res.status(200).json({ "id": user.id, token });
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
                }

            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

}

const verifyPhone = async (req, res) => {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        let errors = [];
        result.array().forEach(error => {
            errors.push(error.msg);
        });
        return res.status(422).json({ message: errors });
    }

    const id = req.params.id;
    const { country_code, phone } = req.body;
    //verifing if the user exists
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        } else if (user.phoneVerified) {
            return res.status(409).json({ message: 'Phone number already verified' });
        } else if (user.countryCode !== parseInt(country_code) || user.phone !== parseInt(phone)) {
            return res.status(400).json({ message: 'Phone number with id ' + id + ' does not match with the phone number provided' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

    const options = {
        method: 'GET',
        url: 'https://phonenumbervalidatefree.p.rapidapi.com/ts_PhoneNumberValidateTest.jsp',
        params: {
            number: country_code + phone,
        },
        headers: {
            'X-RapidAPI-Key': process.env.VERIFY_PHONE_API_KEY,
            'X-RapidAPI-Host': 'phonenumbervalidatefree.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        if (response || response.isValidNumber) {

            try {
                await prisma.user.update({
                    where: {
                        id: parseInt(id)
                    },
                    data: {
                        phoneVerified: true
                    }
                });

                return res.status(200).json({ message: 'Phone number verified successfully' });
            } catch (error) {
                console.log(error);
                return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }
}

const sendVerifyEmail = async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        let errors = [];
        result.array().forEach(error => {
            errors.push(error.msg);
        });
        return res.status(422).json({ message: errors });
    }

    const id = req.params.id;
    const { email } = req.body;

    //verifing if the user exists
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        } else if (user.email !== email) {
            return res.status(400).json({ message: 'Email with id ' + id + ' does not match with the email provided' });
        } else if (user.emailVerified) {
            return res.status(409).json({ message: 'Email already verified' });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }


    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const token = crypto.randomBytes(32).toString('hex');

    const verificationLink = process.env.SELF_URL + 'verify-email/' + token;

    const msg = {
        to: email,
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject: 'Verify your email',
        text: `Please click on the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`,
        html: `Please click on the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`,
    }

    sgMail.send(msg)
        .then((response) => {
            console.log(response[0].statusCode);
            console.log(response[0].headers);
            verificationTokens.push({ email, token });
            return res.status(200).json({ message: 'Email sent successfully' });
        }
        ).catch((error) => {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
        });

}

const verifyEmail = async (req, res) => {

    const token = req.params.token;

    const tokenIndex = verificationTokens.findIndex(t => t.token === token);

    if (tokenIndex === -1) {
        return res.status(404).json({ message: 'Url not found' });
    }

    const email = verificationTokens[tokenIndex].email;

    try {
        await prisma.user.update({
            where: {
                email
            },
            data: {
                emailVerified: true
            }
        });

        verificationTokens.splice(tokenIndex, 1);

        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

}

module.exports = {
    register,
    login,
    verifyPhone,
    sendVerifyEmail,
    verifyEmail
}