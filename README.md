# AI Knowledge Base Widget

A simple, powerful B2B SaaS that automatically ingests your documentation and creates an AI-powered support widget. No manual FAQ entry needed—just add URLs, sitemaps, or files and your AI assistant learns instantly. Built with Next.js 16, AI SDK v5, and designed for marketplace distribution (Shopify App Store, WooCommerce, and more).

## Features

- **🚀 Auto-Ingest Knowledge Base**: Automatically crawl and index your help docs, FAQs, and documentation from URLs, sitemaps, or files—no manual entry needed
- **🎯 RAG-Based Accuracy**: Uses vector embeddings (pgvector) for precise, context-aware answers from your knowledge base
- **📝 Source Citations**: AI responses include source URLs so customers can verify information
- **💬 Embeddable Widget**: One-line script tag to embed an AI-powered support widget on any website
- **📊 Analytics Dashboard**: Track conversations, deflection rates, and cost estimates
- **🔄 Auto-Refresh**: Re-ingest knowledge bases with one click to keep content up-to-date

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: AI SDK v6 with OpenAI GPT-4o
- **Database**: PostgreSQL with Prisma ORM and pgvector extension
- **Embeddings**: OpenAI text-embedding-3-small
- **Integrations**: Works on any website—Shopify, WooCommerce, or custom sites
- **UI Components**: shadcn/ui with Tailwind CSS
- **MCP Integration**: Next.js MCP, Vercel MCP, and shadcn MCP for enhanced development experience

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database with pgvector extension
- OpenAI API key

### MCP Integration

This project is configured with Model Context Protocol (MCP) servers for enhanced development:

- **Next.js MCP**: Provides real-time error detection, project metadata, and development insights
- **Vercel MCP**: Enables deployment and configuration management
- **shadcn MCP**: Facilitates component management and styling

The `.mcp.json` file is already configured. When you start your dev server, MCP-compatible coding assistants can automatically discover and connect to provide context-aware assistance.

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd support-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory (see `.env.example` for reference):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/support_agent?schema=public"
PRISMA_DATABASE_URL="prisma+postgres://..."

# NextAuth (for production, NEXTAUTH_URL is auto-set by Vercel)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email (for production auth)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@support-agent.com"

# OpenAI
OPENAI_API_KEY="sk-..."

# Shopify
SHOPIFY_API_KEY="your-shopify-api-key"
SHOPIFY_API_SECRET="your-shopify-api-secret"
SHOPIFY_APP_URL="http://localhost:3000"

# Intercom
INTERCOM_CLIENT_ID="your-intercom-client-id"
INTERCOM_CLIENT_SECRET="your-intercom-client-secret"
INTERCOM_REDIRECT_URI="http://localhost:3000/api/oauth/intercom"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."

# JWT
JWT_SECRET="your-jwt-secret-key"
```

**For production deployment on Vercel**, see `VERCEL_ENV_SETUP.md` for detailed instructions.

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Usage

### 1. Build Knowledge Base

Go to `/dashboard/knowledge` and:
- Add URLs (e.g., `https://yourstore.com/help`)
- Add sitemaps for bulk ingestion
- Upload files (PDF, Markdown, etc.)

The system will automatically:
- Crawl and parse content
- Chunk text into searchable segments
- Generate vector embeddings
- Store in PostgreSQL with pgvector

### 2. Embed Widget

Copy the embed script from the Knowledge Base page and add it to your website:

```html
<script src="http://localhost:3000/api/embed?tenantId=your-tenant-id"></script>
```

The widget will appear as a chat bubble in the bottom-right corner.

### 3. View Analytics

Check `/dashboard/analytics` for:
- Total conversations
- Deflection rate
- Escalation count
- Cost estimates

## API Routes

### Chat API
`POST /api/chat`
- Streams AI responses with tool-calling
- Requires: `tenantId`, `sessionId`, `messages`

### Knowledge Ingestion
`POST /api/knowledge/ingest`
- Ingests a URL into the knowledge base
- Requires: `tenantId`, `url`

### Embed Widget
`GET /api/embed?tenantId=...`
- Returns embeddable JavaScript widget

## Architecture

### AI Agent (`lib/ai/agent.ts`)
- Uses knowledge base search tool for RAG-based answers
- Streams responses using AI SDK v5
- Includes source citations in responses

### RAG System (`lib/rag/`)
- **Ingest**: URL crawling, sitemap parsing, file processing
- **Search**: Vector similarity search with pgvector

### Database Schema
- Multi-tenant architecture with row-level isolation
- Stores connections, knowledge bases, chunks, conversations, tool runs, and metrics

## Marketplace Distribution

### Shopify App Store
1. Create a Shopify Partner account
2. Create a new app (no OAuth needed—just embed the widget!)
3. Emphasize in listing: "Auto-ingest your help docs—no manual FAQ entry needed"
4. Highlight unique features: URL/sitemap/file upload, RAG-based accuracy, source citations
5. Submit for review

## Development

### Development Auth Bypass

For easier development, the app includes a dev auth bypass that automatically logs you in as a dev user without requiring email authentication.

**To use dev login:**
1. Navigate to `/dev-login` or click "Dev Login" on the regular login page
2. Click "Login as Dev User"
3. You'll be automatically logged in as `dev@localhost` with tenant `dev-tenant`

**To disable dev auth bypass:**
Set `DEV_AUTH_BYPASS=false` in your `.env.local` file.

**Note:** Dev auth bypass is automatically disabled in production builds.

### Database Migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### Type Checking
```bash
npm run lint
```

### Build for Production
```bash
npm run build
npm start
```

## Roadmap

- [ ] Stripe billing integration
- [ ] Zendesk connector
- [ ] Gorgias connector
- [ ] Notion/Google Docs ingestion
- [ ] Multi-language support
- [ ] Custom branding/theming
- [ ] Advanced analytics and reporting
- [ ] A/B testing for prompts

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
