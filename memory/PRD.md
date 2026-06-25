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

### Phase 1 - Simple Adjustments (Completed)
- Button text changed from "Baixar PDF" to "Baixar Portfolio"
- Comparativo allows viewing competitor without selecting MicroXisto product
- Clickable product suggestions in Comparativo

### Phase 2 - Estagio Field in Planejamento (Completed)
- Added "Estagio" dropdown to product selection (TS, Sulco, V1-V8, R1-R6)
- Same product can be added multiple times for different stages
- Estagio displayed in management summary table

### Phase 3 - PDF Recommendation (Completed)
- "Gerar Recomendacao (PDF)" button in Planejamento
- Single-page PDF with MicroXisto branding template
- Uses EurostileEF Black font for title, color #002F17
- Includes products table with Estagio and Obs. columns
- Financial summary (custo total, por hectare, sacas/ha)
- Optional "Total de Nutrientes Aportados" in compact horizontal grid
- Footer with MicroXisto transparent logo
- Fields: Produtor, Fazenda, Representante, Telefone, Cultura, Colheita, Area, Valor Saca

### Phase 4 - Estudo de Mercado Tab (Completed)
- New "Estudo de Mercado" tab with full CRUD
- Fields: Empresa, Produto, Dose/ha, Valor, Venda type, Estado
- R$/ha auto-calculated
- User-specific data isolation
- Dashboard with national averages by company and regional averages by state
- Admin Excel export

### Phase 4.1 - Estudo de Mercado Enhancements (Completed 2026-06-25)
- **New field**: "Concorre com qual produto MicroXisto?" dropdown with 17 products (Magnus, Pullseed Ni, Pullseed G, Active, One-Max, Complex, MN-MAX, ZINMAX, S-MAX, Guardian, TRUCKER, CA-ULTRA, MG-ULTRA, Citro-X, Tek-F, Alvo, DTA)
- **Admin inline editing**: Admin can view ALL users' records in a single table and edit any record inline (click Editar to convert row to inputs, click Salvar to save)
- **Admin can delete** any user's market study record
- **New Dashboard**: "Análise por Produto MicroXisto" - filter by MicroXisto product to see competitor min/max/avg values and R$/ha

### Admin Tools (Completed)
- Maintenance Mode toggle
- User Activity tracking (total accesses, days active, last access)
- Market Study Excel export (includes new concorre_microxisto field)

### PWA Updates (Completed)
- App icon updated to EasyX logo
- Service Worker cache-busting for maintenance status (iOS fix)
- Auto-update notification banner

## Key API Endpoints
- POST /api/auth/login, /api/auth/register
- GET /api/technologies, /api/products, /api/competitors
- GET/POST/PUT/DELETE /api/market-studies (user's own)
- GET /api/admin/market-studies/all (admin: all users)
- PUT/DELETE /api/admin/market-studies/{id} (admin: edit/delete any)
- GET /api/admin/market-studies/dashboard-by-microxisto (admin: competitor analysis)
- GET /api/maintenance-status
- POST /api/admin/maintenance
- GET /api/admin/market-studies/export

## Database Collections
- users, technologies, products, competitors, cultures
- home_content, planejamentos, settings (maintenance mode)
- market_studies (now includes concorre_microxisto field)

## Current App Version
- SW Cache: easyx-offline-v13
- App Version: 3.3.0

## Remaining/Future Tasks
- P2: Remove maintenance mode after user approves all features (currently OFF)
- P3: Refactoring - App.js is ~5300+ lines; modularize into components
