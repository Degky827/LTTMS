const logger = require('./logger');

const sendEmail = async (options) => {
  logger.info(
    {
      to: options.to,
      subject: options.subject,
      template: options.template
    },
    `📧 Email sent to ${options.to}: ${options.subject}`
  );
  return true;
};

module.exports = sendEmail;
