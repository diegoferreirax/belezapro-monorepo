# 🏗️ Arquitetura e Padrões do Projeto

Este documento descreve a organização estrutural e os padrões técnicos adotados no **BelezaPro**.

## 📂 Estrutura de Pastas (`src/app/`)

O projeto segue uma arquitetura baseada em **Features**, **Shared** e **Core**, promovendo baixo acoplamento e alta coesão.

### 1. `core/`
Contém o "cérebro" da aplicação. Tudo o que é global e instanciado apenas uma vez.
- **`guards/`**: Proteção de rotas (ex: `AuthGuard`).
- **`models/`**: Interfaces e tipos TypeScript (ex: `Appointment`, `Client`).
- **`repositories/`**: Abstrações para acesso a dados (opcional, dependendo da complexidade).
- **`services/`**: Serviços singleton (ex: `SalonService`, `AuthService`).
- **`utils/`**: Funções utilitárias puras.

### 2. `shared/`
Contém recursos que são reutilizados por múltiplas funcionalidades.
- **`components/`**: Botões, inputs, modais genéricos (ex: `BookingForm`).
- **`directives/`**: Comportamentos de DOM reutilizáveis.
- **`pipes/`**: Transformações de dados (ex: `PhonePipe`, `CurrencyFormat`).

### 3. `features/`
Contém os módulos de negócio da aplicação, divididos por domínio de usuário.
- **`admin/`**: Painel administrativo (Gestão de Clientes, Calendário, Serviços, Despesas).
- **`client/`**: Área do cliente (Meus Agendamentos, Login via OTP).
- **`public/`**: Páginas abertas (Landing Page, Fluxo de Reserva).

---

## ⚡ Padrões Técnicos

### Angular Signals
Utilizamos **Signals** para todo o gerenciamento de estado reativo.
- **Benefícios:** Melhor performance, rastreabilidade de mudanças e código mais declarativo.
- **Uso:** `signal()`, `computed()`, `effect()`.

### Zoneless (Angular 21+)
A aplicação é **Zoneless**, o que significa que não dependemos do `zone.js`.
- **Implicação:** Todas as mudanças de estado devem ser feitas via Signals ou acionadores manuais de detecção de mudanças para garantir que a UI seja atualizada.

### Standalone Components
Não utilizamos `NgModules`. Todos os componentes, pipes e diretivas são **Standalone**.
- Isso simplifica as importações e torna os componentes mais independentes.

### Tailwind CSS 4+
Toda a estilização é feita via utilitários do Tailwind CSS.
- **Padrão:** Evitamos arquivos CSS por componente. Estilos globais e temas são definidos em `src/app/app.css`.

### Motion (Animações)
Para animações complexas que o CSS puro não resolve, utilizamos a biblioteca **Motion** (versão vanilla JS) para garantir fluidez e performance.

---

## 🚦 Fluxo de Dados
1. **Componentes de Feature** buscam dados através de **Serviços Core**.
2. O estado é mantido em **Signals** dentro dos serviços ou componentes.
3. **Componentes Shared** recebem dados via `input()` e emitem eventos via `output()`.
