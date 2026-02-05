import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-heading font-semibold">Webbook Generator</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-heading text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Webbook Generator ("we," "our," or "us"). This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our webbook creation platform.
            </p>
            <p>
              <strong>Data Controller:</strong><br />
              Kamil Skomra<br />
              Wiercien, Poland<br />
              Email: hardbanrecordslab.pl@gmail.com
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">2.1 Personal Information</h3>
            <p>When you use our service, we may collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, profile picture (from Google OAuth)</li>
              <li><strong>Payment Information:</strong> Transaction details processed through Stripe and PayPal (we do not store full card numbers)</li>
              <li><strong>Content:</strong> Webbooks, chapters, and other content you create on our platform</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Usage data (pages visited, features used)</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process payments and transactions</li>
              <li>Send transactional emails (payment confirmations, account updates)</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">4. Data Sharing</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Payment Processors:</strong> Stripe and PayPal for transaction processing</li>
              <li><strong>Authentication Providers:</strong> Google for OAuth login</li>
              <li><strong>Email Service Providers:</strong> For sending transactional emails</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p className="mt-4">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against 
              unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SSL/TLS encryption for data in transit</li>
              <li>Secure database storage</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">6. Your Rights (GDPR)</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Object:</strong> Object to certain processing of your data</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at: <strong>hardbanrecordslab.pl@gmail.com</strong>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to provide our services and fulfill the 
              purposes outlined in this policy. Account data is retained until you request deletion. 
              Payment records are retained as required by law (typically 7 years for tax purposes).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. These cookies are necessary 
              for the proper functioning of our service. By using our platform, you consent to the use of 
              these essential cookies.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
            <p>
              Our service is not intended for users under 16 years of age. We do not knowingly collect 
              personal information from children under 16.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="mt-4">
              <strong>Kamil Skomra</strong><br />
              Email: hardbanrecordslab.pl@gmail.com<br />
              Location: Wiercien, Poland
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Button onClick={() => navigate('/')} variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
}
