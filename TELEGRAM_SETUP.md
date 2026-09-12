# Integração do Todo Controle com Telegram

O Todo Controle mantém a interface no GitHub Pages e recebe mensagens do bot por um Worker HTTPS com banco D1. O token do bot nunca deve ser colocado no navegador, no `localStorage` ou no repositório.

## Segredos do ambiente

Configure no ambiente do Worker:

- `TELEGRAM_BOT_TOKEN`: token entregue pelo BotFather.
- `TELEGRAM_WEBHOOK_SECRET`: segredo aleatório com letras, números, `_` ou `-`.
- `TELEGRAM_BOT_USERNAME`: usuário público do bot, sem o `@` (opcional).
- `APP_ORIGINS`: `https://edsonjunioor32.github.io,http://localhost:4173`.

No Cloudflare, abra Workers & Pages, selecione `todo-controle-telegram`, entre em Settings > Variables and Secrets e adicione os três segredos. `APP_ORIGINS` já está configurado como variável comum. Não altere o Worker `sr-vagas-bot`.

## Passos para ativar o Telegram

1. No Telegram, abra o contato oficial `@BotFather`.
2. Use `/newbot` e crie um bot exclusivo para o Todo Controle. Não use o bot das vagas.
3. Copie o token fornecido pelo BotFather e salve-o no segredo `TELEGRAM_BOT_TOKEN` do Worker.
4. Gere um segredo novo para `TELEGRAM_WEBHOOK_SECRET`. Use letras, números, `_` ou `-` e não publique esse valor.
5. Opcionalmente, informe o usuário do bot, sem `@`, em `TELEGRAM_BOT_USERNAME`.
6. Registre o webhook na Bot API apontando para:

   `https://todo-controle-telegram.edsonjunioor32.workers.dev/telegram/webhook`

   No método `setWebhook`, envie essa URL e o mesmo valor usado em `TELEGRAM_WEBHOOK_SECRET` como `secret_token`.
7. Abra o Todo Controle, entre em Telegram e mantenha a URL padrão da ponte.
8. Clique em Gerar código de pareamento e envie `/start CÓDIGO` para o novo bot.
9. Depois que aparecer como conectado, envie uma mensagem de teste, por exemplo: `gastei R$ 35,90 no mercado`.

O Telegram não precisa conhecer o token do bot. O token fica somente no Worker da sua conta Cloudflare.

## Pareamento

1. Abra a tela Telegram no Todo Controle.
2. Gere um código de pareamento.
3. Envie `/start CÓDIGO` ao bot.
4. Envie mensagens como `gastei R$ 35,90 no mercado`.
5. O aplicativo sincroniza os lançamentos após o pareamento.

O backend grava o identificador do update do Telegram e ignora reenvios duplicados. O cartão, a conta e a categoria são resolvidos no dispositivo a partir dos nomes informados na mensagem.

## Backend isolado no Cloudflare

O backend financeiro foi transferido para um projeto Cloudflare separado do Telegram das vagas. Não compartilhe com o serviço de vagas o bot, o webhook, o token ou o banco.

URL do backend na sua conta Cloudflare:

https://todo-controle-telegram.edsonjunioor32.workers.dev

Webhook:

https://todo-controle-telegram.edsonjunioor32.workers.dev/telegram/webhook

Esse Worker e o banco D1 pertencem à sua conta Cloudflare e permanecem separados do serviço de vagas. Use um segundo bot criado no BotFather e configure os segredos nele.

