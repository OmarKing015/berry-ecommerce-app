import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4 text-gray-700">
        <strong>Effective Date:</strong> 2025/8
      </p>

      <p className="mb-4 text-gray-700">
        This Privacy Policy describes how <strong>https://mazagk.vercel.app</strong> ("we", "us", or "our") collects, uses,
        and protects your personal data when you use our website located at  <strong>https://mazagk.vercel.app</strong> and all
        related services (collectively, the "Services").
      </p>

      <p className="mb-6 text-gray-700">
        By accessing or using our Services, you agree to the terms of this Privacy Policy.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
      <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
        <li><strong>Personal Information:</strong> Name, email, shipping address, account credentials, etc.</li>
        <li><strong>Design Data:</strong> Uploaded images, fonts, text, and selected design elements.</li>
        <li><strong>Transaction Data:</strong> Orders, items purchased, payment confirmations.</li>
        <li><strong>Technical Data:</strong> IP address, browser type, OS, and usage behavior.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
      <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
        <li>To fulfill and manage your orders</li>
        <li>To secure your designs and data</li>
        <li>To provide support and improve our Services</li>
        <li>To send you updates and promotional content (if opted-in)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Sharing Your Information</h2>
      <p className="text-gray-700 mb-4">
        We do <strong>not</strong> sell or rent your personal data. We may share limited information with third-party
        service providers (e.g., shipping, payments) strictly as needed to operate our Services. We comply with legal
        obligations when required.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. User-Generated Content</h2>
      <p className="text-gray-700 mb-4">
        You retain full ownership of any designs, files, or content you upload or create. We store these securely to
        enable editing and reordering, but never share or repurpose your designs without your permission.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cookies & Tracking</h2>
      <p className="text-gray-700 mb-4">
        We use cookies and tracking technologies to remember your preferences, analyze usage, and improve your experience.
        You may disable cookies in your browser settings at any time.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
      <p className="text-gray-700 mb-4">
        We retain personal data as long as needed to provide our services and comply with legal obligations. You may
        request deletion of your data at any time.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Rights</h2>
      <p className="text-gray-700 mb-4">
        You may request access, correction, deletion, or restriction of your personal data by contacting us at{" "}
        <a href="mailto:support@yourdomain.com" className="text-blue-600 underline">support@yourdomain.com</a>.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">8. Data Security</h2>
      <p className="text-gray-700 mb-4">
        We implement industry-standard measures to safeguard your data. However, no system is completely secure. You use
        our Services at your own risk.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children’s Privacy</h2>
      <p className="text-gray-700 mb-4">
        Our Services are not intended for users under the age of 13. We do not knowingly collect data from children.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
      <p className="text-gray-700 mb-4">
        We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated
        effective date.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
      <p className="text-gray-700 mb-4">
        If you have questions or concerns about this Privacy Policy, please contact us
       </p>
    </div>
  );
};

export default PrivacyPolicy;
