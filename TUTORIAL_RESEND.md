# Tutorial Resend - Administração do Serviço de E-mail

## O que é o Resend?
O Resend é o serviço que envia os e-mails de recuperação de senha do XistoApp.

---

## 1. Acessar o Painel

1. Acesse: **https://resend.com/login**
2. Faça login com a conta que criou (a mesma que gerou a API Key `re_2aNs51c...`)

---

## 2. Verificar Domínio (IMPORTANTE!)

**Situação atual:** O Resend está em modo teste. E-mails só são enviados para o e-mail da própria conta (`easyx.microxisto@gmail.com`).

**Para enviar para qualquer @microxisto.com.br:**

1. No painel Resend, vá em **Domains** → **Add Domain**
2. Digite: `microxisto.com.br`
3. O Resend vai mostrar registros DNS (TXT e MX) que você precisa adicionar no gerenciador de DNS do seu domínio
4. Adicione os registros DNS conforme instruído
5. Clique em **Verify** no Resend
6. Após verificação (pode levar até 24h), mude o remetente no arquivo `.env` do backend:

```
SENDER_EMAIL=noreply@microxisto.com.br
```

---

## 3. Monitorar E-mails Enviados

No painel Resend:
- **Emails** → Lista todos os e-mails enviados
- Veja status: `delivered`, `bounced`, `complained`
- Clique em qualquer e-mail para ver detalhes

---

## 4. Limites do Plano Gratuito

- **100 e-mails/dia** (suficiente para recuperação de senha)
- **3.000 e-mails/mês**
- 1 domínio verificado

Se precisar de mais, o plano Pro custa $20/mês (50.000 e-mails/mês).

---

## 5. Gerenciar API Keys

- **Dashboard → API Keys**
- Pode criar novas chaves ou revogar antigas
- Se a chave for comprometida, revogue-a imediatamente e crie uma nova

---

## 6. Como funciona no XistoApp

1. Usuário clica em **"Esqueci minha senha"** na tela de login
2. Digita seu e-mail cadastrado
3. Backend gera um código de 6 dígitos (válido por 15 minutos)
4. E-mail é enviado via Resend com o código
5. Usuário digita o código + nova senha
6. Senha é atualizada no banco de dados

---

## 7. Troubleshooting

| Problema | Solução |
|----------|---------|
| E-mail não chega | Verifique se o domínio está verificado no Resend |
| "API key is invalid" | Gere uma nova API Key no painel |
| Limite atingido | Aguarde 24h ou upgrade para plano Pro |
| E-mail vai para spam | Verifique DNS (SPF, DKIM) no painel Resend |

---

## 8. Registros DNS Necessários (após verificar domínio)

Quando verificar o domínio, adicione estes registros no DNS:
- **SPF** (TXT): Permite ao Resend enviar em nome do seu domínio
- **DKIM** (TXT): Assinatura digital que prova autenticidade
- **MX** (opcional): Apenas se quiser receber e-mails de bounce

O Resend mostra exatamente o que adicionar no momento da verificação.

---

**Resumo rápido:**
- Painel: https://resend.com
- Para funcionar com todos os e-mails: verificar domínio `microxisto.com.br`
- API Key está salva no servidor em `/app/backend/.env`
