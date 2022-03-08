const sgMail = require('@sendgrid/mail')



//sendgrid will know who is trying to send an email:
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    //the send method return a promise
    sgMail.send({
        to: email,
        from: 'sashimifrufru@gmail.com',
        subject: 'Thanks for joining in!',
        //we can use this syntax only in ``command + 9
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
        html: '<h1>Gattino saluta </h1>'
    })
}

const sendSeeYouSoonEmail = (email, name) => {
     sgMail.send({
         to:email,
         from: 'sashimifrufru@gmail.com',
         subject: 'I hate to see you go',
         text: `I hope you will come back, gattino ${name} `

     })
}

module.exports = {
    sendWelcomeEmail,
    sendSeeYouSoonEmail
}