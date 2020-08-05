const sgMail = require('@sendgrid/mail')
//const sendgridAPIKEY ='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' 
//dev added in account

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email ,name ) =>{

    sgMail.send({
        to : email ,
        from : 'akash213kulkarni@gmail.com' ,
        subject:'Welcome Aborad to Task-Manager-app' ,
        text :`Welcome to the app ${name}. Hope you enjoy our sevices.`

    })
}


const sendCancelEmail = (email ,name ) =>{

    sgMail.send({
        to : email ,
        from : 'akash213kulkarni@gmail.com' ,
        subject:'Cancellation Task-Manager-app' ,
        text :`By-Bye ${name}. Hope to see you soon.`

    })
}

module.exports =({
    sendWelcomeEmail ,
    sendCancelEmail 

})
