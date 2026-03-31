# MicroXisto EasyX PWA - Product Requirements Document

## Original Problem Statement
Build and expand a Progressive Web App (PWA) for MicroXisto, a company focused on plant nutrition technology. The app serves as an internal tool for sales teams to compare products, plan applications, and study market data.

## Core Architecture
- **Frontend**: React SPA with Tailwind CSS
- **Backend**: FastAPI (Python) with MongoDB
- **PWA**: Service Worker for offline capabilities
- **Auth**: JWT-based with admin approval flow

## User Personas
- **Admin** (agrofialho@gmail.com): Full access to manage products, competitors, users, maintenance mode, and export data
- **Sales Team** (@microxisto.com.br emails): Access to technologies, cultures, planning, comparison, and market study features

## Implemented Features

### Phase 0 - Core (Previously Completed)
- User authentication (login/register with admin approval)
- Technology showcase with product details
- Competitor comparison system
- Planning module with nutrient calculations
- Cultures section
- Admin panel (users, technologies, products, competitors, CSV import)
- PWA with offline support and auto-update
- Custom domain mapping

### Phase 1 - Simple Adjustments (Completed 2026-03-31)
- Button text changed from "Baixar PDF" to "Baixar Portfolio"
- Comparativo allows viewing competitor without selecting MicroXisto product
- Clickable product suggestions in Comparativo

### Phase 2 - Estagio Field in Planejamento (Completed 2026-03-31)
- Added "Estagio" dropdown to product selection (TS, Sulco, V1-V8, R1-R6)
- Same product can be added multiple times for different stages
- Estagio displayed in management summary table

### Phase 3 - PDF Recommendation (Completed 2026-03-31)
- "Gerar Recomendacao (PDF)" button in Planejamento
- Single-page PDF with MicroXisto branding template
- Uses EurostileEF Black font for title, color #002F17
- Includes products table with Estagio and Obs. columns
- Financial summary (custo total, por hectare, sacas/ha)
- Footer with "Por que eu escolho MICROXISTO" branding (transparent logo)
- Observation field per product in planning form

### Phase 4 - Estudo de Mercado Tab (Completed 2026-03-31)
- New "Estudo de Mercado" tab with full CRUD
- Fields: Empresa, Produto, Dose/ha, Valor, Venda type, Estado
- R$/ha auto-calculated
- User-specific data isolation
- Dashboard with national averages by company and regional averages by state
- Admin Excel export

### Admin Tools (Completed 2026-03-31)
- Maintenance Mode toggle
- User Activity tracking (total accesses, days active, last access)
- Market Study Excel export

## Key API Endpoints
- POST /api/auth/login, /api/auth/register
- GET /api/technologies, /api/products, /api/competitors
- GET/POST/PUT/DELETE /api/market-studies
- GET /api/maintenance-status
- POST /api/admin/maintenance
- GET /api/admin/market-studies/export

## Database Collections
- users, technologies, products, competitors, cultures
- home_content, planejamentos, settings (maintenance mode)
- market_studies

## Remaining/Future Tasks
- P2: Remove maintenance mode after user approves all features
- Refactoring: App.js is ~4600 lines; consider modularizing into components
