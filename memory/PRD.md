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

### Sessão 07/04/2026
- **Correção cálculo AquaX**: Volume total agora = Nº aplicações × Dose × Área (estava faltando multiplicar pela área)
- Verificado visualmente: CitroX com 3 aplicações × 2 L/ha × 100 ha = 600.0 L ✅

### Sessão 04/04/2026
- **Planejamento AquaX**: Produtos AquaX (CitroX, TEK-F, Alvo, DTA) usam "Nº de aplicações" em vez de "Estágio"
- **Campo Prazo**: Adicionado ao cabeçalho do Planejamento
- **Label Valor (R$/L)**: Atualizado de "Valor/L(R$)" para "Valor (R$/L)"
- **Testes iteração 6**: 100% passed (10 backend + 11 frontend)

### Sessão 02-03/04/2026
- Layout Desktop completo, ícones SVG, footer, segurança admin, PWA icons, Service Worker v11
- Planejamento "Outros", bottom nav fix, queries MongoDB limitadas

### Sessões anteriores
- Dashboard Estudo de Mercado, PDF com logo HD, Home mobile, bottom nav, domínio customizado

## Backlog

### P1
- Deploy final para easyx.agr.br

### P2
- Refatorar App.js (5638+ linhas) em componentes menores
- Otimização PWA: melhorar cache offline
- Paginação nas consultas de dados
