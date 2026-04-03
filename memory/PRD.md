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
4. **Planejamento** - Cálculos de manejo com Soja/Milho (com Extração/Exportação) e "Outros" (apenas Nutrientes Aportados)
5. **Comparativo** - Comparação entre produtos MicroXisto e concorrentes
6. **Estudo de Mercado** - CRUD de estudos com dashboard agregado e exportação xlsx
7. **Admin Panel** - Gerenciamento de tudo (protegido por JWT is_admin)

## Stack Técnica
- Frontend: React 19, Tailwind CSS, PWA (Service Worker v11)
- Backend: FastAPI, JWT Authentication, bcrypt
- Database: MongoDB
- Domínio customizado: easyx.agr.br

## O que foi implementado

### Sessão 02-03/04/2026 (final)
- **Planejamento "Outros"**: Opção para culturas além de Soja/Milho com campos condicionais
- **Segurança admin reforçada**: JWT decoded no frontend, useEffect redireciona não-admins
- **Bottom nav fix**: pb-44 para conteúdo não ser coberto pela barra inferior
- **Ícone PWA atualizado**: apple-touch-icon 180px, manifest icons 192/512px
- **Service Worker v11**: Cache atualizado para forçar refresh em iOS
- **Ícones SVG personalizados**: Tecnologias (átomo+hexágono) e Comparativo (frascos+régua+setas)
- **Layout Desktop**: Hero side-by-side, header com navegação, footer com redes sociais
- **Footer**: microxisto.com.br, Instagram, Facebook, LinkedIn
- Queries MongoDB limitadas (.to_list(5000))
- 1000 registros fake removidos

### Sessões anteriores
- Dashboard Estudo de Mercado (admin: filtros cascata, min/avg/max; user: por estado)
- PDF com logo HD e cores corretas (jsPDF)
- Home page mobile redesenhada (hero rock, custom logo, paleta verde)
- Bottom navigation bar, Service Worker com auto-update
- Domínio customizado easyx.agr.br

## Backlog

### P1
- Ícones das culturas via links de imagem do Imgur

### P2
- Refatorar App.js (5580+ linhas) em componentes menores
- Otimização PWA: melhorar cache offline
- Paginação nas consultas de dados
