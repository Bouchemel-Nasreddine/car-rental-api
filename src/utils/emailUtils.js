
const sgMail = require('@sendgrid/mail');


const sendEmail = async (email, subject, text) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: email,
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject: subject,
        text: text,
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
        return false
    }
    return true;
}

module.exports = {
    sendEmail
}