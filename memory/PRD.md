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

### Sessão 02/04/2026 (final)
- Ícones SVG customizados para Tecnologias (átomo/molécula) e Comparativo (frascos+régua+setas)
- Segurança admin reforçada: JWT decoded no frontend (não mais confiando em localStorage)
- useEffect de proteção: redireciona não-admin para Home se tentar acessar /admin
- Instruções PWA melhoradas: modal com passos para iOS (Safari) e Android (Chrome)
- Queries MongoDB limitadas (to_list(5000)) para produção
- Deploy preparado e aprovado pelo deployment agent

### Sessão 02/04/2026 (anterior)
- Layout Desktop completo com hero side-by-side, header e footer
- Footer profissional com redes sociais (site, Instagram, Facebook, LinkedIn)
- Ícone XistoApp cortado (removido whitespace)
- 1000 registros fake do Estudo de Mercado removidos
- Classes CSS mobile-only/desktop-only para responsividade

### Sessões anteriores
- Dashboard completo do Estudo de Mercado
- PDF com logo HD e cores corretas
- Home page mobile redesenhada
- Bottom navigation bar
- Service Worker com auto-update
- Domínio customizado easyx.agr.br

## Backlog (P0/P1/P2)

### P1 (Importante)
- Ícones das culturas via links de imagem do Imgur

### P2 (Melhorias)
- Refatorar App.js (5500+ linhas) em componentes menores
- Otimização PWA: melhorar cache offline
- Paginação nas consultas de dados
