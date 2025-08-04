import emailjs from '@emailjs/browser';

interface EmailParams {
  to_name: string;
  to_email: string;
  order_id: string;
  total_amount: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export const sendOrderConfirmationEmail = async (params: EmailParams) => {
  const emailJSConfig = {
    serviceID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
    templateID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
  };

  if (!emailJSConfig.serviceID || !emailJSConfig.templateID || !emailJSConfig.publicKey) {
    console.error('EmailJS config is missing');
    return { success: false, error: 'EmailJS config is missing' };
  }

  try {
    await emailjs.send(emailJSConfig.serviceID, emailJSConfig.templateID, params, emailJSConfig.publicKey);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};
