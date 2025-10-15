# 📚 Tutorial: Salvar no GitHub e Fazer Deploy

Este tutorial explica como salvar seu projeto MicroXisto PWA no GitHub e fazer o deploy na plataforma Emergent.

---

## 🔄 Parte 1: Salvar no GitHub (Commit & Push)

### Opção A: Usando a Interface da Plataforma Emergent (RECOMENDADO)

**A forma mais simples é usar a funcionalidade nativa da plataforma:**

1. **Localize o botão "Save to Github"** na interface do chat
   - Está localizado próximo ao campo de entrada de mensagens
   - Ícone: 🔄 ou símbolo do GitHub

2. **Clique em "Save to Github"**
   - A plataforma irá automaticamente:
     - Fazer commit das suas mudanças
     - Fazer push para o repositório GitHub conectado
     - Manter o histórico de versões

3. **Confirme a operação**
   - Aguarde a mensagem de confirmação
   - Seu código estará salvo no GitHub

**Vantagens:**
- ✅ Não precisa usar linha de comando
- ✅ Automático e seguro
- ✅ Mantém o histórico limpo
- ✅ Integrado com a plataforma

---

### Opção B: Via Linha de Comando (Avançado)

⚠️ **IMPORTANTE**: Não use comandos git diretamente se você não tem experiência. Use a Opção A acima.

Se você realmente precisar usar comandos git, entre em contato com o suporte da plataforma Emergent primeiro, pois há regras específicas sobre operações git.

---

## 🚀 Parte 2: Fazer Deploy na Plataforma Emergent

### Passo 1: Acessar a Área de Deploy

1. **Entre na sua conta** na plataforma Emergent
2. **Acesse o projeto** MicroXisto PWA
3. **Localize o botão/menu de Deploy**
   - Geralmente está no topo da página ou no menu lateral
   - Procure por: "Deploy", "Publicar", ou ícone de foguete 🚀

### Passo 2: Configurar o Deploy

1. **Selecione o tipo de deploy:** "Native Deploy" ou "Deploy Nativo"
   
2. **Verifique as configurações:**
   - ✅ Backend: FastAPI (Python)
   - ✅ Frontend: React
   - ✅ Database: MongoDB
   - ✅ Porta do Backend: 8001
   - ✅ Porta do Frontend: 3000

3. **Variáveis de Ambiente** (já configuradas, apenas confirme):
   - `MONGO_URL` (backend)
   - `DB_NAME` (backend)
   - `SECRET_KEY` (backend)
   - `REACT_APP_BACKEND_URL` (frontend)

### Passo 3: Iniciar o Deploy

1. **Clique em "Deploy" ou "Publicar"**
   - O processo pode levar alguns minutos
   - Aguarde a conclusão

2. **Acompanhe o progresso:**
   - Logs aparecerão na tela
   - Procure por mensagens de sucesso ou erro

3. **Deploy concluído:**
   - Você receberá uma URL de produção
   - Exemplo: `https://seu-app.emergent.app`

### Passo 4: Verificar o Deploy

1. **Acesse a URL de produção**
2. **Teste as funcionalidades principais:**
   - Login (agrofialho@gmail.com / adm@123)
   - Navegação entre páginas
   - Planejamento com as novas tabelas
   - Dropdown de cultura (Soja/Milho)
   - Mensagem de aviso nas tabelas

---

## ✅ Checklist Final

Antes de considerar o deploy concluído, verifique:

- [ ] Código salvo no GitHub
- [ ] Deploy iniciado sem erros
- [ ] URL de produção acessível
- [ ] Login funcionando
- [ ] Menu Planejamento acessível
- [ ] Dropdown de cultura (Soja/Milho) funcionando
- [ ] Tabelas de Extração e Exportação aparecendo
- [ ] Mensagem de aviso visível abaixo das tabelas
- [ ] Design responsivo no mobile

---

## 🆘 Suporte

### Se encontrar problemas:

1. **Verifique os logs de deploy**
   - Procure por mensagens de erro em vermelho
   - Anote a mensagem exata do erro

2. **Entre em contato com o Suporte da Emergent**
   - Use o chat de suporte na plataforma
   - Forneça:
     - Nome do projeto: MicroXisto PWA
     - Mensagem de erro (se houver)
     - Etapa onde ocorreu o problema

3. **Documentação adicional:**
   - Consulte a documentação oficial da plataforma Emergent
   - Veja os tutoriais em vídeo (se disponíveis)

---

## 📝 Notas Importantes

### Sobre o GitHub:
- ⚠️ **NÃO delete** as pastas `.git` ou `.emergent`
- ⚠️ **NÃO execute** comandos git de escrita (push, pull, etc.) manualmente
- ✅ **USE** sempre a funcionalidade "Save to Github" da plataforma

### Sobre o Deploy:
- O deploy nativo da Emergent já está configurado para seu stack (FastAPI + React + MongoDB)
- As variáveis de ambiente estão corretas e seguras
- O app está pronto para produção

### Sobre Rollback:
- A plataforma Emergent oferece funcionalidade de "Rollback"
- Use-a se precisar voltar para uma versão anterior
- É gratuito e não afeta seu código no GitHub

---

## 🎉 Conclusão

Seu app MicroXisto PWA está pronto para produção! 

**Alterações nesta versão:**
- ✅ Tabelas de Extração e Exportação de Nutrientes
- ✅ Dropdown de cultura (Soja/Milho)
- ✅ Mensagem de aviso sobre valores de referência
- ✅ Correções de segurança (SECRET_KEY em env)
- ✅ Design responsivo mobile-friendly

**Boa sorte com o deploy! 🚀**

---

*Tutorial criado em: 15/10/2025*
*Versão da aplicação: v2.0 - Planejamento com Tabelas de Nutrientes*
