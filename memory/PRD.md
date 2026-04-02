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

### Sessão 02/04/2026 (continuação)
- Cortado whitespace do ícone XistoApp (removido ~135px de padding branco do PNG)
- Removidos 1000 registros fake de Estudo de Mercado
- **Layout Desktop implementado**:
  - Header com navegação completa (Início, Tecnologias, Culturas, Planejamento, Comparativo, Estudo de Mercado, Admin, Sair)
  - Hero section side-by-side: branding+botões à esquerda, imagem da rocha à direita
  - Grid de 3 colunas para botões de feature
  - Header visível na Home page apenas no desktop (oculto no mobile)
  - Classes CSS `mobile-only` e `desktop-only` para visibilidade responsiva
  - Hover animations nos botões desktop (translate-y e shadow)
- Corrigido bug de botões Login/Cadastro duplicados no header desktop
- Corrigido erro `currentUser is not defined` no header mobile

### Sessão 02/04/2026 (anterior)
- Criados endpoints faltantes no backend (maintenance, market-studies, competitors, activity)
- Removido manutencao.html estático
- Bug fix: Cultura CRUD retornava 500 (ObjectId serialization) - corrigido
- Bug fix: Update cultura sobrescrevia ID com None - corrigido
- PDF fixes: Título verde escuro, campos deslocados, logo HD
- Dashboard Estudo de Mercado movido para Admin com filtros, tabela min/avg/max, export Excel
- Para usuários comuns: aba "Estudo de Mercado" mostra apenas preços do estado dele
- Assets reais no pdfAssets.js
- Home page mobile redesenhada com hero image, custom logo, paleta verde, bottom nav
- Todos os testes de frontend passaram (100%)

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
- Ícones das culturas via links de imagem do Imgur (usuário vai inserir manualmente)
- Suporte para campo image_url nas culturas (backend + frontend)

### P2 (Melhorias)
- Refatorar App.js (5300+ linhas) em componentes menores
- Otimização PWA: melhorar cache offline
- Testes automatizados mais abrangentes
- Adicionar data-testid em todos os elementos interativos
