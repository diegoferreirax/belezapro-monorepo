# Plano de Implementação: Migração do Login Cliente (Frontend Cache ➔ Java JWT)

Trilhar o caminho de migração the um Cache Fake the Autenticação no Cliente the voltas pro ecossistema JWT do Spring Boot.

## 1. Refatoração do Serviço (`auth.service.ts`)
Remover a persistência direta the localStorage the variáveis primitivas sem segurança (`localStorage.setItem('user')`) e lógicas Fakes de validação ("123456").
Fazer a antiga rotina `loginClient` espelhar a `loginAdmin`: apontar à nossa API the Java Method `POST /api/auth/login`.  Trazer o OTP the cache com o password de forma a obter o Token Oficial. Guardar o Token para o `checkSession()` decifrar os metadados.

## 2. Ajuste Mestre da GUI (`otp-login.component.ts`) 
Como a troca deixará de ser um retorno booleano `true/false`, atualizar os receptores para se adaptarem a chamadas Http. A interface passará a interceptar os retornos the Promessa / Observable. Se der erro Http (401 the Credencial ou The Contas Bloqueadas), gerar disparo de mensagem bloqueando o Wizard the navegação do site.

## 3. Lixo de Sessão (Higiene)
Rotinas the `logout` precisam garantir a destruição da antiga prop primitiva `"user"` pra evitar que ex-clientes logados the forma fictícia no cache antigo fiquem retidos inoperantes no novo portal the microserviço.
