
const PrismaClient = require('@prisma/client').PrismaClient;
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

function verifyToken(token) {
    try {
        // Verify the token using the JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If the verification is successful, return the payload data
        return decoded;
    } catch (error) {
        console.log(error);
        // If there's an error (e.g., token expired or invalid), handle it here
        return null; // You can return null or handle the error differently
    }
}

async function getUpdatedToken(cred) {
    if (cred.token === null || cred.token === "" || !verifyToken(cred.token)) {
        const newToken = jwt.sign({
            id: cred.id,
            email: cred.email
        }, process.env.JWT_SECRET, {
            expiresIn: '1m'
        });

        await updateTokenInDatabase(newToken, cred.id);

        return newToken;
    } else {
        return cred.token;
    }
}

async function updateTokenInDatabase(newToken, credId) {
    try {
        await prisma.Credential.update({
            where: {
                id: credId
            },
            data: {
                token: newToken
            }
        });
    } catch (error) {
        console.log(error);
    }
}

function getTokenFromHeaders(headers) {
    // Check if the Authorization header is present
    if (!headers.authorization) {
        return null; // No Authorization header found
    }

    const authHeader = headers.authorization;

    // Check if the Authorization header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        return null; // Invalid format
    }

    // Extract the token after "Bearer "
    const token = authHeader.substring('Bearer '.length);
    return token;
}


module.exports = { verifyToken, getTokenFromHeaders, getUpdatedToken };