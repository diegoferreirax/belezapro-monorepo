# Planejamento Arquitetural: Login por Código OTP via E-mail

Uma abordagem de autenticação _"Passwordless"_ (Sem senhas fixas) através de Códigos Descartáveis (OTPs) enviados por e-mail é extremamente segura e eleva radicalmente o nível do projeto. Clientes (CLIENT) não precisam criar/decorar senhas, apenas ter acesso ao próprio e-mail.

Eis a resposta para a sua principal pergunta: **Qual é o esforço total para essa engrenagem?**
O esforço é **Médio**. Levaremos algumas horas de desenvolvimento, pois envolve montar uma peça estrutural robusta no Java e no Angular.

Para implementar de ponta a ponta de forma profissional, arquitetaremos a seguinte estrutura:

## 1. Modificações Massivas no Backend (Java Spring Boot)
Precisamos montar duas esteiras logísticas do lado do Servidor: **Armazenagem Temporária** e **Disparo SMTP**.

*   **1.1 - Dependência de E-mail (`spring-boot-starter-mail`)**: Injetar e configurar um serviço disparador SMTP. Precisaremos de configurações num `.env` ou `application.properties` para o SMTP host (durante o teste podemos apenas injetar lógicas de Log.info no console simulando o envio e adotar plataformas gratuitas de desenvolvedor como *SendGrid/Mailtrap* depois).
*   **1.2 - OTP Generation Storage**: Não podemos armazenar OTPs no cache do browser, então precisamos salvar o código `(Ex: 859345)` e linkar ao e-mail assinado com um cronômetro de morte (Expirar em 5 minutos).
    *   *Sugestão Limpa*: Ao invés de subir um contêiner *"Redis"* inteiro só pra isso, podemos fazer o MongoDB trabalhar pesado usando uma **TTL Collection**! Salva lá, em 5 min o banco deleta nativamente.
*   **1.3 - Novos Endpoints (`AuthController.java`)**: 
    1.  `POST /api/auth/otp/request`: (Recebe E-mail) -> Gera 6 dígitos -> Salva no Banco na TTL ->  Dispara e-mail.
    2.  `POST /api/auth/otp/validate`: (Recebe E-mail e OTP num payload) -> Checa o banco -> Se casar os dados e não expirado: **Gera o JWT Token Clássico**! e apaga o OTP do banco.

## 2. Modificações no Frontend (Angular)
O atual formulário se transformará num **Wizard** de Duas Etapas:

*   **Componente `otp-login`**: O usuário enxerga apenas o campo de "E-mail". O botão "Avançar" engatilha a API `/request`. Se retornar status 200 (E-mail enviado), a tela colapsa o Input e-mail para modo "Leitura/Trava", e libera os espaços de `Código recebido (OTP)` na tela + botão the `Reenviar código`.
*   **Serviço (`auth.service.ts`)**: Teremos duas rotas independentes:
    *   `requestClientOtp(email: string): Observable<void>`
    *   `validateClientOtp(email: string, otp: string): Observable<{token: string}>` (Substituindo a antiga `loginClient`).

### Tempo / Custo Base
*   **Java Backend**: Implementação de Entidades/Models the OTP Collection, Service the Regex/Random String, e Service local the Disparo de e-mails JavaMailSender (~2-3 Horas).
*   **Angular Frontend**: Separação UX de etapas, gestão the estado visual loading, contador the expiração regressivos para o "Reenviar código" the OTP (~1 Hora).

### Vale a Pena?
Gera um fluxo formidável the nível *Apple/Uber*. É extremamente seguro contra vazamentos the tabelas e senhas fracas.
