import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for RestoM Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6A00;">Welcome to RestoM!</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px;">
          <h1 style="color: #FF6A00; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};