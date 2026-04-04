# Proposta The Migração: Catálogo The Serviços (Multi-Tenant)

Aplicação adotando arquitetura **Multi-Tenant** (Uma plataforma para centenas de Salões/Barbearias rodando independentes isolados por `adminId`).

## O Alvo: Catálogo the Serviços (`Service`)

### Parte 1: Camada Java / Mongo
A classe the documento passará a ter a trava raiz: `private String adminId`. 

**Isolamento no Controller/Repository:**
- `GET /api/v1/services`: O Java não vai mais listar todos. O `ServiceController` irá puxar o Token JWT atual da sessão (via `SecurityContext`), extrair o ID do logado e pedir ao Mongo servicos apenas do admin logado.
- `POST /api/v1/services`: O Front End não vai enviar the quem é o serviço. O Java puxará o ID seguro pela sessão the Token e carimbará o Serviço antes The salvar (`service.setAdminId(jwtUserId)`).
- `PUT / DELETE`: Checar obrigatoriamente se quem está deletando é o dono.

### Parte 2: O Seed Automático (Criação Fictícia)
- No `DataSeeder.java`, criar usuário Padrão com Permissão `ADMIN` (admin@belezapro.com).
- Pega o `id` dele e injeta nos 12 serviços bases the manicure originais do Array Cache.

### Parte 3: Angular Camada
- Serviços the HttpClient do `salon.service.ts` trocarão Listas Fixas por `this.apiService.get('/services')`.
- Rota Pública aberta futura para o cliente sem token acessar o menu do salão exato.
