import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-lg">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this application, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions. If you do not
              agree to these terms, please do not use the application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. SMS Communications</h2>
            <p>
              By using our application, you may receive SMS notifications related to your account
              and activity. You can opt out of these communications at any time by:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Visiting your <Link to="/profile" className="text-blue-600 hover:underline">Profile Settings</Link></li>
              <li>Navigating to the "Notifications" section</li>
              <li>Toggling off the "SMS Notifications" option</li>
            </ul>
            <p className="mt-2">
              Please note that even after opting out, you may still receive essential service-related
              messages that are necessary for the operation of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Privacy</h2>
            <p>
              Your privacy is important to us. Our use of your personal information is governed
              by our Privacy Policy. By using the application, you consent to the collection
              and use of your information as described therein.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Modifications</h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. We will
              notify users of any material changes. Your continued use of the application
              following such modifications constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account and access to the
              application at our discretion, without notice, for conduct that we believe
              violates these Terms and Conditions or is harmful to other users, us, or third
              parties, or for any other reason.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Contact</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us
              through the appropriate channels provided in the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;