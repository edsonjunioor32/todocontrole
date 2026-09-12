# Integração do Todo Controle com Telegram

O Todo Controle mantém a interface no GitHub Pages e recebe mensagens do bot por um Worker HTTPS com banco D1. O token do bot nunca deve ser colocado no navegador, no `localStorage` ou no repositório.

## Segredos do ambiente

Configure no ambiente do Worker:

- `TELEGRAM_BOT_TOKEN`: token entregue pelo BotFather.
- `TELEGRAM_WEBHOOK_SECRET`: segredo aleatório com letras, números, `_` ou `-`.
- `TELEGRAM_BOT_USERNAME`: usuário público do bot, sem o `@` (opcional).
- `APP_ORIGINS`: `https://edsonjunioor32.github.io,http://localhost:4173`.

Depois de publicar o Worker, registre o webhook usando a URL `/telegram/webhook` e o mesmo `TELEGRAM_WEBHOOK_SECRET` no método `setWebhook` da Bot API.

## Pareamento

1. Abra a tela Telegram no Todo Controle.
2. Gere um código de pareamento.
3. Envie `/start CÓDIGO` ao bot.
4. Envie mensagens como `gastei R$ 35,90 no mercado`.
5. O aplicativo sincroniza os lançamentos após o pareamento.

O backend grava o identificador do update do Telegram e ignora reenvios duplicados. O cartão, a conta e a categoria são resolvidos no dispositivo a partir dos nomes informados na mensagem.
