import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_d33crda';
const EMAILJS_TEMPLATE_ID = 'template_kxd3spd';
const EMAILJS_PUBLIC_KEY = 'JFTicMJY1P3lms8ir';

/**
 * Sends an OTP email using EmailJS.
 * 
 * @param {string} toEmail - The recipient's email address (mapped to {{email}} in template)
 * @param {string} otpCode - The 6-digit OTP code to send
 * @param {string} name - (Optional) The recipient's name
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const sendOTPEmail = async (toEmail, otpCode, name = 'Customer') => {
  try {
    const templateParams = {
      email: toEmail,
      otp: otpCode,
      code: otpCode, // Just in case the template uses {{code}} instead of {{otp}}
      name: name
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('OTP email sent successfully:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
};
