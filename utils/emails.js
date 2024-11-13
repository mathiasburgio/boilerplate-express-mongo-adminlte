
async function sendMail({from, to, subject, templateID, enlace}){
    try{
        const mailerSend = new MS.MailerSend({
            apiKey: process.env.MAILERSEND_API_TOKEN,
        });
        
        const sentFrom = new MS.Sender(from, process.env.APP_NAME);
        
        const recipients = [
          new MS.Recipient(to)
        ];
        
        //enviaremail
        const personalization =  [
            {
                email: to,
                data: {
                    email: to,
                    enlace: enlace
                },
            }
        ];
            
        const emailParams = new MS.EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject(subject)
          .setPersonalization(personalization)
          .setTemplateId(templateID);
        
        let ret = await mailerSend.email.send(emailParams);
        return ret;
    }catch(err){
        throw err;   
    }
}

module.exports = sendMail;