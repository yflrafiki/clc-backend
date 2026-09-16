const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendPaymentNotification = async ({ to, memberName, type, amount, datePaid }) => {
  if (!to) return;

  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Christian Life Way'
    },
    subject: `✅ ${type} Payment Received — Christian Life Way`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2563eb); padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Christian Life Way</h2>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Church Record Management System</p>
        </div>
        <div style="padding: 24px;">
          <p style="color: #374151;">Dear <strong>${memberName}</strong>,</p>
          <p style="color: #374151;">Your <strong>${type}</strong> payment has been successfully recorded.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Type</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; color: #111827;">${type}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Amount</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; color: #111827;">GH₵ ${Number(amount).toLocaleString()}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Date</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; color: #111827;">${new Date(datePaid).toLocaleDateString()}</td>
            </tr>
          </table>
          <p style="color: #6b7280; font-size: 13px; font-style: italic;">"Bring the whole tithe into the storehouse" — Malachi 3:10</p>
        </div>
        <div style="background: #f3f4f6; padding: 12px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Christian Life Way Church © ${new Date().getFullYear()}</p>
        </div>
      </div>
    `
  };

  await sgMail.send(msg);
};

module.exports = { sendPaymentNotification };
