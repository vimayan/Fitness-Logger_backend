const nodeMailer = require("nodemailer");

const sendEmail = async (email, subject, link) => {
  const transporter = await nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  transporter.sendMail(
    {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html: `please click this mail to confirm:<a href = ${link}>${link}</a>`,
    },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent successfully");
      }
    }
  );
};

module.exports = sendEmail;
