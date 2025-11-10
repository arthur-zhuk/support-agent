import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Terms of Service - AI Knowledge Base Widget',
  description: 'Terms of service for AI Knowledge Base Widget',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing or using AI Knowledge Base Widget (&quot;Service&quot;), you agree to be bound by these 
                Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                AI Knowledge Base Widget is a software-as-a-service platform that allows you to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Ingest and index documentation, FAQs, and help content</li>
                <li>Create an AI-powered support widget for your website</li>
                <li>Provide automated customer support through AI responses</li>
                <li>Track analytics and conversation metrics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
              <p className="text-muted-foreground mb-4">
                To use the Service, you must:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Create an account with accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 18 years old or have parental consent</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service to generate spam or unsolicited content</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or harvest information about other users</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Your Content</h3>
              <p className="text-muted-foreground mb-4">
                You retain ownership of all content you upload to the Service. By uploading content, you grant us 
                a license to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Process, index, and store your content</li>
                <li>Use your content to generate AI responses</li>
                <li>Display your content in the Service</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                You represent and warrant that you have the right to upload all content and that it does not 
                violate any third-party rights.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Our Intellectual Property</h3>
              <p className="text-muted-foreground mb-4">
                The Service, including its software, design, and functionality, is owned by us and protected by 
                intellectual property laws. You may not copy, modify, distribute, or create derivative works 
                without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Subscription and Payment</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Subscription Plans</h3>
              <p className="text-muted-foreground mb-4">
                We offer various subscription plans with different features and usage limits. You can upgrade, 
                downgrade, or cancel your subscription at any time through your account settings.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Payment Terms</h3>
              <p className="text-muted-foreground mb-4">
                By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Pay all fees associated with your subscription</li>
                <li>Provide accurate billing information</li>
                <li>Authorize us to charge your payment method</li>
                <li>Pay fees in advance on a monthly or annual basis</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Refunds</h3>
              <p className="text-muted-foreground mb-4">
                Subscription fees are non-refundable except as required by law. If you cancel your subscription, 
                you will continue to have access until the end of your billing period. No refunds will be provided 
                for partial billing periods.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.4 Price Changes</h3>
              <p className="text-muted-foreground mb-4">
                We reserve the right to change our pricing at any time. We will provide at least 30 days&apos; 
                notice of any price increases. Your continued use of the Service after the price change constitutes 
                acceptance of the new pricing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              <p className="text-muted-foreground mb-4">
                We strive to maintain high availability but do not guarantee uninterrupted or error-free service. 
                The Service may be temporarily unavailable due to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Maintenance and updates</li>
                <li>Technical issues or failures</li>
                <li>Force majeure events</li>
                <li>Third-party service outages</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                We are not liable for any damages resulting from Service unavailability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. AI Responses and Accuracy</h2>
              <p className="text-muted-foreground mb-4">
                The Service uses artificial intelligence to generate responses based on your knowledge base content. 
                You acknowledge that:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>AI responses may not always be accurate or complete</li>
                <li>You are responsible for reviewing and verifying AI-generated content</li>
                <li>We are not liable for any errors or inaccuracies in AI responses</li>
                <li>You should not rely solely on AI responses for critical decisions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND</li>
                <li>WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
                <li>WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground mb-4">
                You agree to indemnify and hold us harmless from any claims, damages, losses, liabilities, and 
                expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Content you upload to the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">11.1 By You</h3>
              <p className="text-muted-foreground mb-4">
                You may cancel your account at any time through your account settings. Upon cancellation, your 
                access will continue until the end of your billing period.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">11.2 By Us</h3>
              <p className="text-muted-foreground mb-4">
                We may suspend or terminate your account if you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Violate these Terms</li>
                <li>Fail to pay fees when due</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Misuse the Service</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">11.3 Effect of Termination</h3>
              <p className="text-muted-foreground mb-4">
                Upon termination:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Your right to use the Service immediately ceases</li>
                <li>We may delete your account and data</li>
                <li>You remain liable for all fees incurred</li>
                <li>Provisions that should survive termination will remain in effect</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution</h2>
              <p className="text-muted-foreground mb-4">
                Any disputes arising from these Terms or the Service shall be resolved through binding arbitration 
                in accordance with the rules of [Arbitration Organization]. The arbitration shall take place in 
                [Location]. You waive your right to a jury trial and to participate in class actions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground mb-4">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of material changes 
                by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Your continued 
                use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-none text-muted-foreground space-y-2 mb-4">
                <li><strong>Email:</strong> <a href="mailto:contact@velocityspanlabs.com" className="text-primary hover:underline">contact@velocityspanlabs.com</a></li>
                <li><strong>Support:</strong> <a href="mailto:contact@velocityspanlabs.com" className="text-primary hover:underline">contact@velocityspanlabs.com</a></li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

