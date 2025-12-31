// app/privacy-policy/page.tsx
"use client";

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto">
      
      {/* Main Heading */}
      <h1 className="text-lg font-bold mb-4">Privacy Policy</h1>

      {/* Body content */}
      <p className="text-sm text-gray-700 mb-4">
        At Mobile Lab Xpress, your privacy isn’t just a legal obligation—it’s a
        vital part of how we operate. We safeguard your confidential and
        proprietary information by following all industry standards and legal
        requirements. We ensure that only essential personal information is
        collected and used strictly for delivering our mobile healthcare
        services.
      </p>

      <p className="text-sm text-gray-700 mb-6">
        We comply fully with the Health Insurance Portability and Accountability
        Act (HIPAA), the HITECH Act, and all relevant federal privacy
        regulations. To uphold your privacy rights, we follow the principles
        outlined below.
      </p>

      {/* Sub Heading */}
      <h2 className="text-base font-medium mb-2">Our Privacy Principles</h2>

      <ul className="list-disc list-inside space-y-3 text-sm text-gray-700">
        <li>
          Only individuals with legal authorization may access your Protected
          Health Information (PHI).
        </li>
        <li>
          Every team member is responsible for securing their passwords and
          system access credentials.
        </li>
        <li>
          Client information is never discussed in public spaces or
          unprotected environments.
        </li>
        <li>
          Any suspected breach of confidentiality must be reported immediately
          to our Privacy Officer or an appropriate supervisor.
        </li>
      </ul>


      {/* Our Promise Section */}
        <section className="mt-6">
        <h2 className="text-lg font-bold mb-4">Our Promise</h2>

        <p className="text-sm text-gray-700 mb-4">
            Mobile Lab Xpress takes HIPAA and HITECH compliance seriously. Every team member,
            including field staff and managers, goes through privacy and security training and
            testing twice a year. Confidentiality isn’t just a word for us. Each healthcare
            professional gets a unique login; everyone passes a background check, and we regularly
            reach out to clients for feedback to keep our quality and safety standards high.
        </p>

        <p className="text-sm text-gray-700 mb-4">
            Mobile Lab Xpress also runs regular HIPAA-required risk assessments to evaluate
            the security of our systems and processes. If any issue is identified, we address it
            immediately, always with your privacy in mind. If you have any questions or need
            assistance, please email us at
            <a
            href="mailto:support@mobilelabxpress.com"
            className="text-blue-600 underline ml-1"
            >
            support@mobilelabxpress.com
            </a>.
        </p>
        </section>

        {/* Information We Collect */}
        <section className="mt-6">
        <h2 className="text-lg font-bold mb-4">Information We Collect</h2>

        <p className="text-sm text-gray-700 mb-4">
            To provide our medical and logistical services, Mobile Lab Xpress collects basic
            information such as your name, address, date of birth, and other details classified
            as Protected Health Information (PHI). At times, this may include health-related
            information or details about the services being coordinated.
        </p>

        {/* For Mobile App Users */}
        <h3 className="text-base font-medium mt-6 mb-2">For Mobile App Users</h3>

        <p className="text-sm text-gray-700 mb-2">We collect:</p>

        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Mobile number</li>
            <li>Your precise location (only while you’re on an active shift)</li>
        </ul>

        <p className="text-sm text-gray-700 mb-4">
            This information helps us ensure accurate routing and supports proper app functionality.
            When you cancel your account, all associated data is permanently deleted. The app clearly
            notifies you whenever it collects your location or other data. We do not track your location
            or collect any information after your shift ends.
        </p>

        {/* Data Sharing & Transmission */}
        <h3 className="text-base font-medium mt-6 mb-2">Data Sharing &amp; Transmission</h3>

        <p className="text-sm text-gray-700 mb-4">
            At times, we may receive health information from others involved in your care, such as
            doctors, medical facilities, or care agencies. We exchange this information only through
            secure APIs or encrypted communication channels.
        </p>

        <p className="text-sm text-gray-700 mb-4">
            For mobile app users, all sensitive data transmitted during your shift is protected using
            strong, industry-standard encryption technology. The app will notify you whenever data is
            being transmitted, and no information is sent after your shift has ended.
        </p>
        </section>

        {/* Data Protection & Security */}
        <section className="mt-6">
        <h2 className="text-lg font-bold mb-4">Data Protection &amp; Security</h2>

        <p className="text-sm text-gray-700 mb-4">
            Within Mobile Lab Xpress, only authorized individuals can access your information,
            and always through secure channels. We use strong administrative, physical, and
            electronic safeguards to prevent unauthorized access, maintain data accuracy,
            and ensure your PHI is used properly. Before releasing any information or making
            account changes, we always verify your identity to protect your privacy and security.
        </p>

        {/* Cookies & Tracking Technologies */}
        <h3 className="text-base font-medium mt-6 mb-2">Cookies &amp; Tracking Technologies</h3>

        <p className="text-sm text-gray-700 mb-4">
            At Mobile Lab Xpress, we use cookies and similar technologies to improve your
            browsing experience and better understand how users interact with our services.
            These tools help us enhance performance, personalize features, and identify
            areas that need improvement. You may adjust or disable cookies at any time
            through your browser settings.
        </p>

        {/* Children’s Privacy */}
        <h3 className="text-base font-medium mt-6 mb-2">Children’s Privacy</h3>

        <p className="text-sm text-gray-700 mb-4">
            Protecting children’s privacy is important to us. We do not knowingly collect
            personal information from anyone under the age of 13 without verified consent
            from a parent or legal guardian. When we provide services involving minors,
            such as blood draws, we strictly follow required procedures for consent
            and supervision.
        </p>

        {/* Changes to This Privacy Policy */}
        <h3 className="text-base font-medium mt-6 mb-2">Changes to This Privacy Policy</h3>

        <p className="text-sm text-gray-700 mb-4">
            As our services evolve, this Privacy Policy may be updated. If we make any
            significant changes, we will notify you on our website or via email. Continued
            use of our services after updates indicates your acceptance of the revised policy.
        </p>
        </section>

    </div>
  );
}
