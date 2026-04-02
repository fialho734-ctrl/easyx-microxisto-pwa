# EasyX / MicroXisto - PRD

## Problema Original
PWA multi-plataforma e responsiva para consulta e comparação de produtos Microxisto, com painel de administração visual, acesso offline e preparação para publicação em app stores.

## Personas
- **Consultor de campo**: Acessa tecnologias, compara produtos, planeja aplicações
- **Administrador**: Gerencia tecnologias, produtos, concorrentes, culturas, estudos de mercado, usuários
- **Usuário comum**: Acessa informações de produtos e mercado após aprovação

## Funcionalidades Core
1. **Início** - Home com conteúdo editável pelo admin
2. **Tecnologias** - Lista de tecnologias MicroXisto e seus produtos
3. **Culturas** - Culturas agrícolas com links para materiais
4. **Planejamento** - Cálculos de manejo com tabelas de Extração/Exportação e geração de PDF
5. **Comparativo** - Comparação entre produtos MicroXisto e concorrentes
6. **Estudo de Mercado** - CRUD de estudos com dashboard agregado e exportação xlsx
7. **Admin Panel** - Gerenciamento de tudo (usuários, tecnologias, produtos, concorrentes, culturas, manutenção, atividade)

## Stack Técnica
- Frontend: React 19, Tailwind CSS, PWA (Service Worker)
- Backend: FastAPI, JWT Authentication, bcrypt
- Database: MongoDB
- Infra: Kubernetes, Emergent Platform
- Domínio customizado: easyx.agr.br

## O que foi implementado

### Sessão atual (02/04/2026)
- Criados endpoints faltantes no backend:
  - `GET /api/maintenance-status` + `POST /api/admin/maintenance`
  - `GET/POST/PUT/DELETE /api/market-studies`
  - `GET /api/market-studies/dashboard`
  - `GET /api/admin/market-studies/dashboard-filtered`
  - `GET /api/admin/market-studies/export` (xlsx)
  - `GET /api/competitors` (lista completa)
  - `POST /api/track-activity` + `GET /api/admin/user-activity`
- Removido `manutencao.html` estático que bloqueava login
- Criado `pdfAssets.js` stub para corrigir erro de compilação
- Instalado jspdf e jspdf-autotable para geração de PDF
- JWT token inclui `is_admin` claim (corrigido em sessão anterior)
- Todos os 21 testes de backend passaram (100%)
- Frontend funcional com todas as navegações

### Sessões anteriores
- Tabelas de Extração/Exportação no Planejamento
- Service Worker com notificação de atualização
- Domínio customizado easyx.agr.br
- Sugestões clicáveis no Comparativo
- Inputs numéricos sem "0" padrão no Planejamento
- Sincronização do App.js com versão do usuário

## Backlog (P0/P1/P2)

### P0 (Crítico)
- Nenhum bloqueio atual

### P1 (Importante)
- Substituir imagens placeholder das culturas por imagens reais
- Adicionar assets reais no pdfAssets.js (logo e decoração para PDFs)
- Adicionar data-testid em todos os elementos interativos

### P2 (Melhorias)
- Refatorar App.js (5183 linhas) em componentes menores
- Otimização PWA: melhorar cache offline
- Testes automatizados mais abrangentes
