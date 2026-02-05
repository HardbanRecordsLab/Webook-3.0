import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function Terms() {
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
        <h1 className="font-heading text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using Webbook Generator ("Service"), you agree to be bound by these Terms of Service 
              ("Terms"). If you disagree with any part of these terms, you do not have permission to access the Service.
            </p>
            <p className="mt-4">
              <strong>Service Provider:</strong><br />
              Kamil Skomra<br />
              Wiercien, Poland<br />
              Email: hardbanrecordslab.pl@gmail.com
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p>
              Webbook Generator is a platform that allows users to create interactive educational webbooks. 
              The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Webbook creation and editing tools</li>
              <li>PDF import functionality</li>
              <li>Chapter management system</li>
              <li>Gamification features (XP, badges, progress tracking)</li>
              <li>HTML export for published webbooks</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">3.1 Registration</h3>
            <p>
              To use certain features of the Service, you must register for an account using Google OAuth. 
              You agree to provide accurate information and keep your account secure.
            </p>
            
            <h3 className="text-xl font-medium mt-4 mb-2">3.2 Account Responsibilities</h3>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">4. Pricing and Payments</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">4.1 Pricing</h3>
            <p>
              <strong>Webbook Publication Fee: $25 USD per webbook (one-time payment)</strong>
            </p>
            <p className="mt-2">
              Creating and editing webbooks is free. Payment is required only when you wish to export 
              and publish your webbook as a standalone HTML file.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">4.2 Payment Methods</h3>
            <p>We accept payments through:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Credit/Debit Cards (via Stripe)</li>
              <li>PayPal</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">4.3 Refund Policy</h3>
            <p>
              Due to the digital nature of our product, all sales are final. However, we may consider 
              refund requests on a case-by-case basis if:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Service was not delivered as described</li>
              <li>Technical issues prevented access to purchased features</li>
              <li>Request is made within 14 days of purchase</li>
            </ul>
            <p className="mt-2">
              To request a refund, contact us at hardbanrecordslab.pl@gmail.com with your order details.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">5. User Content</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">5.1 Your Content</h3>
            <p>
              You retain all rights to the content you create using our Service (webbooks, chapters, text, images). 
              We do not claim ownership of your content.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">5.2 License to Us</h3>
            <p>
              By using the Service, you grant us a limited license to store, process, and display your content 
              solely for the purpose of providing the Service to you.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">5.3 Prohibited Content</h3>
            <p>You agree not to create or upload content that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Infringes on intellectual property rights</li>
              <li>Contains illegal, harmful, or offensive material</li>
              <li>Contains malware or malicious code</li>
              <li>Violates the privacy of others</li>
              <li>Is fraudulent or deceptive</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
            <p>
              The Service, including its design, features, and code (excluding user content), is owned by 
              Kamil Skomra and protected by copyright and other intellectual property laws.
            </p>
            <p className="mt-2">
              You may not copy, modify, distribute, or reverse engineer any part of the Service without 
              explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WEBBOOK GENERATOR AND ITS OWNER SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or data loss</li>
              <li>Third-party content or actions</li>
            </ul>
            <p className="mt-4">
              Our total liability shall not exceed the amount you paid for the Service in the 12 months 
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
              EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, 
              OR SECURE.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">9. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violation of these Terms. 
              Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your right to use the Service will immediately cease</li>
              <li>You may lose access to your content</li>
              <li>Paid fees are non-refundable unless required by law</li>
            </ul>
            <p className="mt-2">
              You may terminate your account at any time by contacting us at hardbanrecordslab.pl@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Poland, 
              without regard to conflict of law principles. Any disputes shall be resolved in the 
              courts of Poland.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant 
              changes by posting a notice on our website. Continued use of the Service after changes 
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">12. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us:
            </p>
            <p className="mt-4">
              <strong>Kamil Skomra</strong><br />
              Email: hardbanrecordslab.pl@gmail.com<br />
              Location: Wiercien, Poland
            </p>
          </section>

          <section className="mt-12 p-6 bg-muted rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Summary of Key Points</h3>
            <ul className="space-y-2">
              <li>✓ <strong>$25 per webbook</strong> - one-time payment to publish</li>
              <li>✓ <strong>You own your content</strong> - we never claim ownership</li>
              <li>✓ <strong>Creating is free</strong> - pay only when you publish</li>
              <li>✓ <strong>Secure payments</strong> - via Stripe and PayPal</li>
              <li>✓ <strong>Governed by Polish law</strong></li>
            </ul>
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
