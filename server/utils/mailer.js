const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Mail server check
transporter.verify((error) => {
  if (error) console.log(" Mail Server Error:", error.message);
  else console.log(" Mail Server is ready!");
});

const sendOTPMail = async (email, otp) => {
  const mailOptions = {
    from: `"CivixConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "CivixConnect Verification Code",
    html: `<h3>Your OTP is: <b>${otp}</b></h3>`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (err) {
    console.error('Mailer error:', err && err.message ? err.message : err);
    return { success: false, error: err };
  }
};

module.exports = sendOTPMail;