# MobileSec-MS - Mobile Application Security Analysis Platform

## Overview

MobileSec-MS is a modular platform for automated mobile application security analysis. It enables scanning of Android APK files to detect OWASP Mobile Application Security (MAS) vulnerabilities, exposed secrets, insecure cryptographic practices, and missing security best practices. The platform is designed for integration into DevSecOps workflows, providing comprehensive security reports with actionable remediation guidance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing with three main pages:
- Dashboard (/) - Overview of all scans and statistics
- Scan Page (/scan) - Upload and initiate new APK scans
- Report Page (/report/:id) - Detailed vulnerability reports for individual scans

**UI Component System**: shadcn/ui (New York variant) built on Radix UI primitives
- Design follows a professional developer dashboard pattern inspired by GitHub, Linear, and Stripe
- Emphasizes information clarity, hierarchical scannability, and data density balance
- Uses Inter for primary text and JetBrains Mono for code snippets
- Implements a custom color system with support for light/dark themes

**State Management**: TanStack Query (React Query) for server state management
- Centralized query client configuration
- Automatic refetching disabled (staleTime: Infinity)
- Custom fetch wrapper with credential inclusion

**Styling**: Tailwind CSS with custom design tokens
- Spacing primitives using units of 2, 4, 6, and 8
- Custom color variables defined in CSS for theme support
- Responsive grid layouts (12-column system)

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**API Structure**: RESTful endpoints organized in `/api` namespace:
- `GET /api/scans` - Retrieve all scans
- `GET /api/scans/:id` - Get specific scan details
- `POST /api/scans/upload` - Upload APK file
- `POST /api/scans/:id/start` - Initiate scan analysis
- `GET /api/scans/:id/report` - Retrieve formatted scan report

**File Upload**: Multer middleware with 100MB limit, APK-only filter, uploads stored in `uploads/` directory

**Microservices Architecture**: Modular Python analysis engines orchestrated from Node using a lightweight runner (`server/microservices/python-runner.ts`). Scripts live in `server/python_microservices/` and include:

1. **APKScanner** (`apk_scanner.py`)
   - Extracts and analyzes AndroidManifest.xml from APK files using zip inspection
   - Detects: debuggable flags, backup settings, cleartext traffic permissions, exported components
   - Maps findings to CWE classifications

2. **SecretHunter** (`secret_hunter.py`)
   - Scans APK contents for exposed secrets using regex patterns
   - Detects: AWS keys, API keys, private keys, OAuth tokens, database passwords, JWT tokens
   - Pattern-based detection for common credential formats

3. **CryptoCheck** (`crypto_check.py`)
   - Analyzes source code for insecure cryptographic practices
   - Detects: AES/ECB mode, MD5/SHA1 hashing, weak random number generation, hardcoded encryption keys
   - Provides secure alternatives in fix suggestions

4. **NetworkInspector** (`network_inspector.py`)
   - Flags cleartext endpoints and permissive TLS validation artifacts in client-side code

5. **ReportGen** (`report_gen.py`)
   - Adds high-level metadata and signing checks for generated reports

6. **FixSuggest** (`fix_suggest.py`)
   - Emits remediation guidance aligned with MASVS practices

7. **CIConnector** (`ci_connector.py`)
   - Shares guidance for integrating the scanner into CI/CD workflows

**Data Flow**:
1. User uploads APK via frontend
2. File stored temporarily in uploads directory
3. Scan record created in database with "pending" status
4. Microservices execute sequentially, generating findings
5. Findings linked to scan via scanId foreign key
6. Scan status updated to "complete" with duration and overall score
7. Report endpoint aggregates scan and findings data for display

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect

**Database Schema** (`shared/schema.ts`):

**Scans Table**:
- id (UUID, primary key)
- appName, packageName, version (text)
- fileName, filePath (text) - uploaded file metadata
- status (text) - pending, running, complete, failed
- scanDate (timestamp, auto-generated)
- duration (nullable text)
- overallScore (nullable text)

**Findings Table**:
- id (UUID, primary key)
- scanId (foreign key to scans)
- microservice (text) - source service identifier
- title, description (text)
- severity (text) - critical, high, medium, low, info
- cwe (nullable text) - CWE classification
- affectedFiles (text array)
- fixSuggestion (nullable text)
- codeSnippet (nullable text)

**Storage Implementation**: Dual-mode storage system
- `MemStorage` class for in-memory development/testing
- Drizzle schema prepared for PostgreSQL production deployment
- Migration support via drizzle-kit

### Build and Deployment

**Development Mode**:
- Vite dev server with HMR
- Express server with middleware mode integration
- TSX for TypeScript execution

**Production Build**:
- Vite builds frontend to `dist/public`
- esbuild bundles server to `dist/index.js` as ESM
- Static file serving for built frontend

**Environment Configuration**:
- DATABASE_URL required for database connection
- NODE_ENV controls dev vs production behavior

## External Dependencies

**Third-Party Services**:
- Neon Database (serverless PostgreSQL) via `@neondatabase/serverless`
- Google Fonts (Inter, JetBrains Mono) loaded via CDN

**Key NPM Packages**:
- **UI Components**: @radix-ui/* primitives for accessible components
- **Forms**: react-hook-form with @hookform/resolvers for validation
- **Styling**: tailwindcss, class-variance-authority, clsx, tailwind-merge
- **File Processing**: adm-zip for APK extraction, multer for uploads
- **Date Handling**: date-fns for formatting and manipulation
- **Development**: Replit-specific plugins for runtime error overlay, cartographer, dev banner

**Database Tools**:
- drizzle-orm for type-safe queries
- drizzle-kit for schema migrations
- drizzle-zod for schema validation

**Build Tools**:
- Vite for frontend bundling
- esbuild for server bundling
- TypeScript for type checking
- PostCSS with Autoprefixer