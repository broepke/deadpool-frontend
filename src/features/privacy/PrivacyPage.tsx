import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p>
              We are committed to protecting your privacy and personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when
              you use our application. Please read this policy carefully to understand our practices
              regarding your personal data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p>We collect several types of information from and about users of our application:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Personal information (name, email address, phone number)</li>
              <li>Profile information and preferences</li>
              <li>Usage data and activity within the application</li>
              <li>Device information and identifiers</li>
              <li>Communication preferences and history</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Provide and maintain our services</li>
              <li>Notify you about changes and updates</li>
              <li>Improve our user experience</li>
              <li>Send important service communications</li>
              <li>Process your transactions and picks</li>
              <li>Maintain leaderboards and game statistics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. SMS Communications</h2>
            <p>
              If you provide your mobile number, we may send you SMS messages related to your
              account, picks, and important updates. You have control over these communications
              and can opt out at any time through your{' '}
              <Link to="/profile" className="text-blue-600 hover:underline">Profile Settings</Link>.
            </p>
            <p className="mt-2">
              Standard message and data rates may apply. Frequency of messages varies based on
              your activity and preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Service providers who assist in operating our application</li>
              <li>Other users through public leaderboards and profiles</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p className="mt-2">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal information. However, no method of transmission over the internet or
              electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Your Privacy Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Children's Privacy</h2>
            <p>
              Our application is not intended for children under 13 years of age. We do not
              knowingly collect personal information from children under 13. If you believe
              we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new policy on this page and updating the effective date.
              Your continued use of the application after such modifications constitutes your
              acknowledgment of the modified Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please
              contact us through the appropriate channels provided in the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;