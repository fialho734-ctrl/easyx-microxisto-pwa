# Tutorial: Deploy do XistoApp no Railway

## Pré-requisitos
- Conta no GitHub (https://github.com)
- Conta no Railway (https://railway.app) — plano gratuito disponível
- Conta no MongoDB Atlas (https://cloud.mongodb.com) — grátis

---

## Passo 1: Salvar código no GitHub

1. No chat do Emergent, clique no botão **"Save to GitHub"** (na barra de input)
2. Escolha um nome para o repositório (ex: `xistoapp`)
3. O código será enviado para o GitHub automaticamente

---

## Passo 2: Criar banco de dados no MongoDB Atlas (Gratuito)

1. Acesse: https://cloud.mongodb.com
2. Crie uma conta (ou faça login)
3. Clique em **"Build a Database"**
4. Escolha **"M0 Free"** (gratuito, 512MB)
5. Região: **São Paulo (sa-east-1)** se disponível
6. Clique em **"Create Cluster"**

### Configurar acesso:
7. Em **"Database Access"** → **"Add New Database User"**
   - Username: `xistoapp`
   - Password: crie uma senha forte (anote!)
   - Role: **"Read and Write to Any Database"**

8. Em **"Network Access"** → **"Add IP Address"**
   - Clique em **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Isso permite que o Railway se conecte

### Obter a Connection String:
9. Volte para **"Database"** → **"Connect"** → **"Drivers"**
10. Copie a connection string. Será algo como:
```
mongodb+srv://xistoapp:SUASENHA@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
11. **Substitua `SUASENHA`** pela senha que você criou

### Migrar dados do app atual:
12. Não se preocupe — quando você fizer login como admin no novo deploy, o app criará as coleções automaticamente. Você só precisará recadastrar os produtos/tecnologias ou posso criar um script de migração se preferir.

---

## Passo 3: Deploy no Railway

1. Acesse: https://railway.app
2. Faça login com sua conta GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub Repo"**
5. Escolha o repositório `xistoapp` que você salvou no Passo 1
6. Railway vai detectar o `Dockerfile` automaticamente

### Configurar variáveis de ambiente:
7. No projeto Railway, vá em **"Variables"** e adicione:

| Variável | Valor |
|---|---|
| `MONGO_URL` | A connection string do MongoDB Atlas (Passo 2) |
| `DB_NAME` | `xistoapp` |
| `SECRET_KEY` | `microxisto-secret-key-2025-production` |
| `PORT` | `8001` |
| `REACT_APP_BACKEND_URL` | (deixe vazio por agora, preencher após obter o domínio) |

8. Clique em **"Deploy"**

---

## Passo 4: Configurar o domínio

1. Após o deploy, no Railway vá em **"Settings"** → **"Networking"** → **"Generate Domain"**
   - Isso gera um domínio temporário (ex: `xistoapp-production.up.railway.app`)
   - Teste se funciona acessando esse domínio

2. Para usar o domínio `easyx.agr.br`:
   - Em **"Settings"** → **"Networking"** → **"Custom Domain"**
   - Digite: `easyx.agr.br`
   - Railway mostra um registro **CNAME** que você precisa adicionar no Registro.br
   - No Registro.br: **DNS** → **Editar zona** → Adicione/atualize o CNAME conforme instruído

3. Volte às **variáveis de ambiente** e atualize:
   - `REACT_APP_BACKEND_URL` = `https://easyx.agr.br`

4. Faça um **novo deploy** (Railway faz automaticamente ao mudar variáveis)

---

## Passo 5: Verificar

1. Acesse `https://easyx.agr.br`
2. Faça login com `agrofialho@gmail.com` / `adm@123`
3. Teste as funcionalidades: Planejamento, Estudo de Mercado, Recuperação de Senha

---

## Custos

| Serviço | Custo |
|---|---|
| **Railway** | Plano Hobby: $5/mês (500h de uso). Plano gratuito: $0 (limite de 500h/mês e 100MB RAM) |
| **MongoDB Atlas** | M0 Free: $0 (512MB) |
| **Resend** | Free: $0 (100 emails/dia) |
| **Total** | $0 a $5/mês |

---

## Atualizando o App

Sempre que quiser fazer uma alteração:
1. Edite no **Emergent** → clique em **"Save to GitHub"**
2. O Railway faz **deploy automático** ao detectar mudanças no GitHub

---

## Troubleshooting

| Problema | Solução |
|---|---|
| App não carrega | Verifique logs no Railway (clique em "View Logs") |
| Erro de conexão com banco | Confira a `MONGO_URL` nas variáveis do Railway |
| Domínio não funciona | Verifique o CNAME no Registro.br e aguarde propagação DNS |
| E-mails não chegam | Verifique se o domínio `easyx.agr.br` continua verificado no Resend |
