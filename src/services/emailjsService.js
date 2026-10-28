// Sends an email through EmailJS's REST API. Requires "Allow EmailJS API for non-browser
// applications" under Account > Security in EmailJS, and the private key in EMAILJS_PRIVATE_KEY.
const sendEmailJs = async (templateId, templateParams) => {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams
    })
  });

  if (!res.ok) {
    throw new Error(`EmailJS ${res.status}: ${await res.text()}`);
  }
};

module.exports = { sendEmailJs };
