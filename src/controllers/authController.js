
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PrismaClient = require('@prisma/client').PrismaClient;
const { validationResult } = require('express-validator');
const axios = require('axios');

const prisma = new PrismaClient();

const sentSMSCodes = {};

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
            return res.status(400).json({ message: 'Email already exists' });
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
            return res.status(400).json({ message: 'Phone number already exists' });
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

        //now coonecting the credentials with the user
        // await prisma.user.update({
        //     where: {
        //         id: user.id
        //     },
        //     data: {
        //         credentialId: {
        //             connect: {
        //                 id: credentials.id
        //             }
        //         }
        //     }
        // });

        console.log("user", user);

        res.status(201).json({ message: 'User created successfully' });
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

    console.log("req.body: ", req.body);

    const { email, password } = req.body;

    try {
        const user = await prisma.Credential.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'user with this email does not exist' });
        } else {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid password' });
            } else {
                token = jwt.sign(
                    { userId: user.id },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                return res.status(200).json({ token, userId: user.id });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again later or try contact assitance service ' });
    }

}

const verifyPhone = async (req, res) => {

    const options = {
        method: 'GET',
        url: 'https://phonenumbervalidatefree.p.rapidapi.com/ts_PhoneNumberValidateTest.jsp',
        params: {
            number: '+59894887799',
            country: 'UY'
        },
        headers: {
            'X-RapidAPI-Key': process.env.VERIFY_PHONE_API_KEY,
            'X-RapidAPI-Host': 'phonenumbervalidatefree.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    register,
    login,
    verifyPhone
}