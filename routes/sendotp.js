const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "Gmail", // or your email provider
      auth: {
        user: "amitrathore12a@gmail.com",
        pass: "gbzmfjxibpdfmkmi", // or use App Password
      },
    });

    let info = await transporter.sendMail({
      from: '"Orleans App" <amitrathore12a@gmail.com>',
      to: email,
      subject: "Your OTP for Orleans App Signup",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    console.log("OTP sent: %s", info.messageId);
  } catch (err) {
    console.log(err);
    throw new Error("OTP could not be sent");
  }
};

module.exports = sendOtpEmail;
