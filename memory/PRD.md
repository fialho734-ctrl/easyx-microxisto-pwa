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
- Criados endpoints faltantes no backend (maintenance, market-studies, competitors, activity)
- Removido manutencao.html estático
- **Bug fix**: Cultura CRUD retornava 500 (ObjectId serialization) - corrigido
- **Bug fix**: Update cultura sobrescrevia ID com None - corrigido  
- **Bug fix**: Culturas com ID=None no banco restauradas (Soja, dados de teste limpos)
- **PDF fixes**: Título verde escuro (#002F17), campos Colheita/Valor/Telefone deslocados (x=290), logo MicroXisto em alta resolução com fundo transparente (extraída de PDF vetorial do usuário)
- **Dashboard Estudo de Mercado** movido para Painel Admin com filtros (Empresa/Produto/Venda/Estado), tabela min/avg/max, detalhamento por estado, export Excel
- Para usuários comuns: aba "Estudo de Mercado" mostra apenas preços do estado dele
- Assets reais no pdfAssets.js (decoração verde + logo HD)
- Todos os 27 testes passaram

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
