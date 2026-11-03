const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'test') {
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    return transporter;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.ethereal.email') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Ethereal dev account (no real send, preview at https://ethereal.email)
    nodemailer.createTestAccount().then(account => {
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass
        }
      });
      logger.info('Created Ethereal email transporter. Preview URLs will be logged.');
    }).catch(err => {
      logger.error({ err: err.message }, 'Failed to create Ethereal transporter');
    });
  }

  return transporter;
};

const templates = {
  'email-verification': (ctx) => ({
    subject: 'Verify your Lake Tana account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0EA5E9;">Welcome to Lake Tana Eco-Tourism!</h1>
        <p>Hi ${ctx.name},</p>
        <p>Please verify your email address to get started.</p>
        <a href="${ctx.url}" style="display: inline-block; padding: 12px 24px; background: #0EA5E9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
        <p style="margin-top: 20px; color: #666;">This link expires in 24 hours.</p>
      </div>`
  }),
  'password-reset': (ctx) => ({
    subject: 'Reset your Lake Tana password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0EA5E9;">Password Reset Request</h1>
        <p>Hi ${ctx.name},</p>
        <p>You requested a password reset. Click the button below to choose a new password.</p>
        <a href="${ctx.url}" style="display: inline-block; padding: 12px 24px; background: #0EA5E9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 20px; color: #666;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>`
  }),
  'booking-confirmation': (ctx) => ({
    subject: `Booking Confirmed: ${ctx.service}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0EA5E9;">Your Booking is Confirmed!</h1>
        <p>Hi ${ctx.name},</p>
        <p>Thank you for booking with Lake Tana Eco-Tourism. Your reservation details:</p>
        <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Service:</strong> ${ctx.service}</p>
          <p><strong>Date:</strong> ${new Date(ctx.date).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> ${ctx.guests}</p>
          <p><strong>Total:</strong> ${ctx.totalAmount} ETB</p>
          <p><strong>Booking ID:</strong> ${ctx.bookingId}</p>
        </div>
        <p>Every booking directly supports local communities and Lake Tana conservation.</p>
      </div>`
  }),
  'payment-confirmation': (ctx) => ({
    subject: `Payment Receipt: ${ctx.service}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Payment Received!</h1>
        <p>Hi ${ctx.name},</p>
        <p>We've received your payment of <strong>${ctx.amount} ETB</strong> for <strong>${ctx.service}</strong>.</p>
        <p>Booking ID: <code>${ctx.bookingId}</code></p>
        <p>Thank you for supporting sustainable tourism at Lake Tana.</p>
      </div>`
  }),
  'vendor-approved': (ctx) => ({
    subject: 'Vendor Account Approved - Lake Tana',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0EA5E9;">Congratulations!</h1>
        <p>Hi ${ctx.name},</p>
        <p>Your vendor account <strong>${ctx.businessName}</strong> has been approved!</p>
        <a href="${ctx.url}" style="display: inline-block; padding: 12px 24px; background: #0EA5E9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
        <p>Start listing your eco-tourism services today.</p>
      </div>`
  }),
  'vendor-rejected': (ctx) => ({
    subject: 'Vendor Application Status - Lake Tana',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Application Update</h1>
        <p>Hi ${ctx.name},</p>
        <p>Your vendor application for <strong>${ctx.businessName}</strong> was not approved at this time.</p>
        <p>Reason: ${ctx.reason || 'Please contact support for more information.'}</p>
        <p>You may re-apply with updated information.</p>
      </div>`
  }),
  '2fa-code': (ctx) => ({
    subject: 'Your 2FA Code - Lake Tana',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0EA5E9;">Two-Factor Authentication</h1>
        <p>Hi ${ctx.name},</p>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #0EA5E9; text-align: center; padding: 20px; background: #f0f9ff; border-radius: 8px; letter-spacing: 8px;">${ctx.code}</div>
        <p style="margin-top: 20px; color: #666;">This code expires in 10 minutes. Never share this code with anyone.</p>
      </div>`
  }),
  'default': (ctx) => ({
    subject: ctx.subject || 'Notification from Lake Tana',
    html: `<div style="font-family: Arial, sans-serif;"><p>Hi ${ctx.name},</p><p>${ctx.message || 'You have a new notification from Lake Tana Eco-Tourism.'}</p></div>`
  })
};

const renderTemplate = (templateName, context) => {
  const renderFn = templates[templateName] || templates['default'];
  return renderFn(context);
};

const sendEmail = async (options) => {
  try {
    const t = getTransporter();
    if (!t) {
      logger.info({ to: options.to, subject: options.subject }, 'Email transport not ready - logged only');
      return true;
    }

    const { subject, html } = renderTemplate(options.template || 'default', options.context || {});
    const mailOptions = {
      from: `"Lake Tana Eco-Tourism" <${process.env.SMTP_FROM || 'noreply@laketana.com'}>`,
      to: options.to,
      subject: subject || options.subject,
      html
    };

    const info = await t.sendMail(mailOptions);

    if (info.messageId) {
      logger.info({ messageId: info.messageId, to: options.to, subject: mailOptions.subject }, 'Email sent');
    }

    if (info.previewURL) {
      logger.info({ previewURL: info.previewURL }, 'Email preview URL');
    }

    return true;
  } catch (err) {
    logger.error({ err: err.message, to: options.to }, 'Email send failed');
    // Don't throw - email failures should not break core flows
    return false;
  }
};

module.exports = sendEmail;
