import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Privacy Policy - AI Knowledge Base Widget',
  description: 'Privacy policy for AI Knowledge Base Widget',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                AI Knowledge Base Widget (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Account Information</h3>
              <p className="text-muted-foreground mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Email address</li>
                <li>Name (optional)</li>
                <li>Tenant/organization information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Knowledge Base Content</h3>
              <p className="text-muted-foreground mb-4">
                We collect and process the content you provide to build your knowledge base:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>URLs you submit for ingestion</li>
                <li>Sitemap URLs</li>
                <li>Files you upload (PDF, Markdown, etc.)</li>
                <li>Content extracted from the above sources</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Usage Data</h3>
              <p className="text-muted-foreground mb-4">
                We automatically collect information about how you use our service:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Conversation logs (messages between end users and the AI)</li>
                <li>Analytics data (conversation counts, deflection rates)</li>
                <li>API usage and performance metrics</li>
                <li>Error logs and debugging information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Technical Data</h3>
              <p className="text-muted-foreground mb-4">
                We collect technical information automatically:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our AI knowledge base widget service</li>
                <li><strong>Content Processing:</strong> To crawl, index, and process your knowledge base content for AI responses</li>
                <li><strong>AI Responses:</strong> To generate accurate answers to end-user questions using your knowledge base</li>
                <li><strong>Analytics:</strong> To track usage, performance, and provide analytics dashboards</li>
                <li><strong>Billing:</strong> To process payments and manage subscriptions</li>
                <li><strong>Support:</strong> To respond to your inquiries and provide customer support</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">4.1 OpenAI</h3>
              <p className="text-muted-foreground mb-4">
                We use OpenAI&apos;s API to power our AI responses. When end users interact with the widget, 
                their questions and relevant knowledge base content are sent to OpenAI for processing. 
                Please review <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI&apos;s Privacy Policy</a>.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Stripe</h3>
              <p className="text-muted-foreground mb-4">
                We use Stripe for payment processing. Payment information is handled directly by Stripe 
                and is not stored on our servers. Please review <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe&apos;s Privacy Policy</a>.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Hosting & Infrastructure</h3>
              <p className="text-muted-foreground mb-4">
                Our service is hosted on Vercel and uses PostgreSQL databases. Data is stored securely 
                in accordance with industry standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Encryption in transit (HTTPS/TLS)</li>
                <li>Encrypted database storage</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits</li>
                <li>Data backup and recovery procedures</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your data for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active and for 30 days after deletion</li>
                <li><strong>Knowledge Base Content:</strong> Retained while your account is active and deleted upon account deletion</li>
                <li><strong>Conversation Logs:</strong> Retained for analytics purposes, deleted after 90 days of inactivity</li>
                <li><strong>Billing Records:</strong> Retained as required by law (typically 7 years)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights (GDPR & CCPA)</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                To exercise these rights, please contact us at <a href="mailto:contact@velocityspanlabs.com" className="text-primary hover:underline">contact@velocityspanlabs.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 ml-4">
                <li>Maintain your session and authentication state</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Improve our service</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                You can control cookies through your browser settings. However, disabling cookies may 
                affect the functionality of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you believe we have collected 
                information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground mb-4">
                Your information may be transferred to and processed in countries other than your country 
                of residence. These countries may have data protection laws that differ from those in your 
                country. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. 
                You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy, please contact us:
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

