import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> November 14, 2026
          </p>
          <p className="text-gray-700 mb-6">
            This policy describes how Maryland Strikers Sports Club (&quot;MD Strikers&quot;), at 13881 Hopkins Rd, Germantown, MD 20874, handles information on this website. Questions go to{' '}
            <a href="mailto:mdstrikersinc@gmail.com" className="text-blue-600 hover:underline">mdstrikersinc@gmail.com</a> or 301 346 8631.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <div className="text-gray-700 mb-4">
              <p className="mb-3">We collect information you provide directly to us, such as when you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create an account or user profile</li>
                <li>Register for events</li>
                <li>Add guest information</li>
                <li>Contact us for support</li>
                <li>Subscribe to our communications</li>
              </ul>
              <p className="mt-4">This information may include:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Name, email address, and phone number</li>
                <li>Address and location information</li>
                <li>Event registration details</li>
                <li>Guest information (with your consent)</li>
                <li>Special requirements and dietary restrictions</li>
                <li>Emergency contact information</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <div className="text-gray-700 mb-4">
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process event registrations and manage attendance</li>
                <li>Communicate with you about events and updates</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our services and user experience</li>
                <li>Ensure event safety and security</li>
                <li>Comply with legal obligations</li>
                <li>Send important notifications about your account</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
            <div className="text-gray-700 mb-4">
              <p className="mb-3">We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Event Organizers:</strong> We share necessary information with event organizers to facilitate your participation</li>
                <li><strong>Service Providers:</strong> We may share information with trusted third parties who assist us in operating our platform</li>
                <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
                <li><strong>Emergency Situations:</strong> We may share information in emergency situations to ensure safety</li>
                <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
            <div className="text-gray-700 mb-4">
              <p className="mb-3">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              </ul>
              <p className="mt-4">To exercise these rights, please contact us using the information provided below.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Google AdSense and cookies</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                This site may show third-party ads through Google AdSense. Google and its advertising partners may use cookies to serve and measure those ads, including ads based on visits to this site and other sites, after you allow them.
              </p>
              <p>
                The ownership script in the page head may be present before you choose. Ad units load only after you choose <strong>Accept</strong>. <strong>Reject</strong> leaves the ad units unloaded. You can open the choice again from Cookie settings in the footer.
              </p>
              <p>
                Control personalized ads in{' '}
                <a href="https://adssettings.google.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Google Ads Settings
                </a>
                . Google&apos;s privacy policy is at{' '}
                <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  policies.google.com/privacy
                </a>
                . Sign-in cookies are separate from advertising cookies.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Maryland Strikers Sports Club</strong><br />
                <strong>Email:</strong> mdstrikersinc@gmail.com<br />
                <strong>Phone:</strong> 301 346 8631<br />
                <strong>Address:</strong> 13881 Hopkins Rd, Germantown, MD 20874
              </p>
            </div>
          </section>

          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-500">
              This Privacy Policy explains how we collect, use, and protect your personal information. By using our services, you consent to the practices described in this policy.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}