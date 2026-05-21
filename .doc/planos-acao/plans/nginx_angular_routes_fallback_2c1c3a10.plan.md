---
name: Nginx Angular routes fallback
overview: Corrigir 404 do nginx em rotas do Angular acessadas direto (incluindo rotas com resolver), adicionando configuração de SPA fallback (`try_files ... /index.html`) e cobrindo cenário de publicação em subpath.
todos:
  - id: inspect-current-nginx
    content: Adicionar arquivo de config do nginx no frontend com fallback para SPA (try_files -> /index.html) e regras de cache.
    status: completed
  - id: dockerfile-copy-nginx-config
    content: Atualizar frontend/Dockerfile para copiar a config do nginx para /etc/nginx/conf.d/default.conf.
    status: completed
  - id: subpath-strategy
    content: "Definir estratégia de subpath: (A) rewrite no proxy/ingress para servir como raiz no container, ou (B) nginx+Angular base-href específico."
    status: completed
  - id: validate-routing
    content: Validar hard reload nas rotas /booking, /admin/*, /client/* no container do frontend.
    status: completed
isProject: false
---

## Diagnóstico (confirmado no repo)
- O `frontend/Dockerfile` usa `nginx:alpine` e **não copia nenhum arquivo de configuração do nginx**. Logo o container roda com o `default.conf` padrão, que só serve arquivos estáticos e retorna **404** quando você acessa uma rota do Angular direto pela URL.
- As rotas Angular incluem `resolve` (ex.: `path: 'booking'` com `resolve: { companies: bookingCompaniesResolver }` em `[frontend/src/app/app.routes.ts](frontend/src/app/app.routes.ts)`), mas o `resolver` não tem relação com o 404: o 404 vem do nginx antes do Angular carregar.

## Mudança principal (SPA fallback)
- Criar um arquivo de configuração do nginx no frontend, por exemplo:
  - `[frontend/nginx/default.conf](frontend/nginx/default.conf)`
- Configurar o `server` para:
  - Servir arquivos estáticos normalmente.
  - Para qualquer rota que não corresponda a um arquivo real, **cair no `index.html`**.

Config base (quando o reverse-proxy/ingress encaminha o subpath já “re-escrito” para `/` dentro do container, ou quando o app está na raiz):
- `location / { try_files $uri $uri/ /index.html; }`
- `location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ { try_files $uri =404; expires 1y; add_header Cache-Control "public, max-age=31536000, immutable"; }`
- `location = /index.html { add_header Cache-Control "no-store"; }`

## Cenário de subpath sem rewrite (opcional, depende do seu deploy)
Se o frontend estiver publicado em um caminho tipo `/algum-subpath/` **sem** o proxy reescrever para `/` no container, o nginx precisa de um `location` específico e o Angular precisa ser buildado com base-href compatível.

Opção A (recomendado): ajustar o proxy/ingress para reescrever `/subpath/*` -> `/*` (container continua servindo em `/`).
- Mantém nginx simples e evita mexer no `base-href`.

Opção B: suportar subpath no nginx + build
- No nginx: `location /SUBPATH/ { try_files $uri $uri/ /SUBPATH/index.html; }` (mais regras de assets, etc.)
- No build Angular: `ng build --configuration production --base-href /SUBPATH/` (e possivelmente `--deploy-url /SUBPATH/` dependendo de como seus assets são referenciados).

## Ajuste no Dockerfile
- Atualizar `[frontend/Dockerfile](frontend/Dockerfile)` para copiar a configuração do nginx para dentro da imagem:
  - `COPY nginx/default.conf /etc/nginx/conf.d/default.conf`

## Validação (local)
- Buildar a imagem do frontend e rodar o container.
- Testar no browser (hard reload):
  - `/booking` (rota com resolver)
  - `/admin/appointments` (rota filha)
  - `/client/appointments`
- Confirmar que:
  - 404 desaparece (nginx devolve `index.html`).
  - Assets continuam com cache forte e `index.html` sem cache (evita atualizar app e o usuário ficar preso em build antigo).
