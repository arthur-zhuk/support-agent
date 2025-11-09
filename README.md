# Support Agent - Order-Aware AI Support Widget

A B2B SaaS that converts your store's documentation and storefront data into an intelligent, order-aware support agent. Built with Next.js 16, AI SDK v6, and designed for marketplace distribution (Shopify App Store, Intercom App Store).

## Features

- **AI-Powered Support Agent**: Uses OpenAI GPT-4o with tool-calling to answer questions, check order status, process returns, and escalate to human agents
- **Knowledge Base RAG**: Ingest URLs, sitemaps, or files to build a searchable knowledge base with vector embeddings
- **Shopify Integration**: Connect your Shopify store to enable order lookup, returns, cancellations, and return label generation
- **Intercom Integration**: Seamlessly escalate conversations to Intercom with full context
- **Embeddable Widget**: Copy-paste script tag to embed the support agent on any website
- **Analytics Dashboard**: Track conversations, deflections, escalations, and cost estimates

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: AI SDK v6 with OpenAI GPT-4o
- **Database**: PostgreSQL with Prisma ORM and pgvector extension
- **Embeddings**: OpenAI text-embedding-3-small
- **Integrations**: Shopify Admin API, Intercom API
- **UI Components**: shadcn/ui with Tailwind CSS
- **MCP Integration**: Next.js MCP, Vercel MCP, and shadcn MCP for enhanced development experience

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database with pgvector extension
- OpenAI API key
- Shopify Partner account (for OAuth app)
- Intercom developer account (for OAuth app)

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
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/support_agent?schema=public"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

OPENAI_API_KEY="sk-..."

SHOPIFY_API_KEY="your-shopify-api-key"
SHOPIFY_API_SECRET="your-shopify-api-secret"
SHOPIFY_APP_URL="http://localhost:3000"

INTERCOM_CLIENT_ID="your-intercom-client-id"
INTERCOM_CLIENT_SECRET="your-intercom-client-secret"
INTERCOM_REDIRECT_URI="http://localhost:3000/api/oauth/intercom"

JWT_SECRET="your-jwt-secret-key"
```

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

### 1. Connect Integrations

Navigate to `/dashboard/connections` and connect:
- **Shopify**: Click "Connect" and authorize the app
- **Intercom**: Click "Connect" and authorize the app

### 2. Build Knowledge Base

Go to `/dashboard/knowledge` and:
- Add URLs (e.g., `https://yourstore.com/help`)
- Add sitemaps for bulk ingestion
- Upload files (PDF, Markdown, etc.)

The system will automatically:
- Crawl and parse content
- Chunk text into searchable segments
- Generate vector embeddings
- Store in PostgreSQL with pgvector

### 3. Embed Widget

Copy the embed script from the Knowledge Base page and add it to your website:

```html
<script src="http://localhost:3000/api/embed?tenantId=your-tenant-id"></script>
```

The widget will appear as a chat bubble in the bottom-right corner.

### 4. View Analytics

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

### OAuth Callbacks
- `GET /api/oauth/shopify` - Shopify OAuth callback
- `GET /api/oauth/intercom` - Intercom OAuth callback

### Embed Widget
`GET /api/embed?tenantId=...`
- Returns embeddable JavaScript widget

## Architecture

### AI Agent (`lib/ai/agent.ts`)
- Orchestrates tool-calling with structured outputs
- Integrates Shopify tools, Intercom tools, and knowledge search
- Streams responses using AI SDK v6

### Tools (`lib/ai/tools/`)
- **Shopify**: Order lookup, returns, cancellations, label generation
- **Intercom**: Ticket creation, escalation with context

### RAG System (`lib/rag/`)
- **Ingest**: URL crawling, sitemap parsing, file processing
- **Search**: Vector similarity search with pgvector

### Database Schema
- Multi-tenant architecture with row-level isolation
- Stores connections, knowledge bases, chunks, conversations, tool runs, and metrics

## Marketplace Distribution

### Shopify App Store
1. Create a Shopify Partner account
2. Create a new app with OAuth scopes: `read_orders`, `write_orders`
3. Set redirect URI: `https://yourdomain.com/api/oauth/shopify`
4. Submit for review

### Intercom App Store
1. Create an Intercom developer account
2. Register OAuth app with redirect URI: `https://yourdomain.com/api/oauth/intercom`
3. Submit for review

## Development

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
