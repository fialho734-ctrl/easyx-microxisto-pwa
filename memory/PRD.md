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
4. **Planejamento** - Cálculos de manejo com relatórios salvos (10 dias), AquaX, Soja/Milho/Outros
5. **Comparativo** - Comparação entre produtos MicroXisto e concorrentes
6. **Estudo de Mercado** - CRUD com prazo (A vista/Safra/Safrinha), dashboard regional
7. **Admin Panel** - Gerenciamento + Contador de Acessos agregado
8. **Recuperação de Senha** - Via e-mail com código de 6 dígitos (Resend)

## Stack Técnica
- Frontend: React 19, Tailwind CSS, PWA (Service Worker v11)
- Backend: FastAPI, JWT Authentication, bcrypt
- Database: MongoDB
- E-mail: Resend (transacional)
- Domínio customizado: easyx.agr.br

## O que foi implementado

### Sessão 27/04/2026
- **A - Estudo de Mercado**: Campo "Prazo" (A vista/Safra/Safrinha), labels "Valor (R$/L)" e "Dose (L/ha)"
- **A1 - Visibilidade regional**: Já implementado no backend (dashboard agrega por estado do usuário)
- **B1 - Meus Relatórios**: Salvar/abrir relatórios do Planejamento por 10 dias (CRUD completo)
- **B2 - Investimento**: Substituído "Custo" por "Investimento" em todo Planejamento + PDF
- **C - Recuperação de Senha**: Fluxo completo via Resend (código 6 dígitos, 15 min validade)
- **D - Contador de Acessos**: Corrigido - agora agrega por usuário (total acessos, dias ativos, último acesso)
- **Testes iteração 7**: 100% frontend, 94% backend (17/18 - 1 falso positivo)

### Sessão 07/04/2026
- Correção cálculo AquaX: Volume = Nº aplicações × Dose × Área
- Cultura "Outros": Remove "Investimento em Sacas/ha"

### Sessão 04/04/2026
- Planejamento AquaX (Nº aplicações), Campo Prazo, Label Valor (R$/L)

### Sessão 02-03/04/2026
- Layout Desktop, ícones SVG, footer, segurança admin, PWA icons, Service Worker v11
- Planejamento "Outros", bottom nav fix

### Sessões anteriores
- Dashboard Estudo de Mercado, PDF com logo HD, Home mobile, bottom nav, domínio customizado

## Backlog

### P1
- Deploy final para easyx.agr.br
- Verificar domínio microxisto.com.br no Resend (para enviar e-mails para qualquer usuário)

### P2
- Refatorar App.js (5989+ linhas) em componentes menores
- Otimização PWA: melhorar cache offline
- Paginação nas consultas de dados
