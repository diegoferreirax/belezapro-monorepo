# 🚀 Funcionalidades do Sistema

Este documento descreve as funcionalidades e fluxos de usuário do **BelezaPro**.

## 👑 Painel Administrativo (`/admin`)

O painel administrativo é o centro de operações do salão, permitindo o gerenciamento completo do negócio.

### 1. Gestão de Agendamentos (`/admin/appointments`)
- **Calendário Semanal:** Visualização intuitiva de todos os agendamentos da semana.
- **Criação de Agendamentos:** Fluxo simplificado para agendar clientes via telefone ou presencialmente.
- **Edição e Cancelamento:** Alteração de horários, serviços e status (Pendente, Confirmado, Concluído, Cancelado).
- **Filtros:** Visualização por data e status.

### 2. Gestão de Clientes (`/admin/clients`)
- **Listagem Completa:** Busca e visualização de todos os clientes cadastrados.
- **Perfil do Cliente:** Histórico de agendamentos, preferências e dados de contato.
- **Bloqueio de Clientes:** Opção de bloquear clientes por comportamento inadequado ou faltas recorrentes.

### 3. Gestão de Serviços (`/admin/services`)
- **Catálogo de Serviços:** Cadastro de manicure, pedicure, podologia e outros.
- **Configuração de Preços e Duração:** Definição clara de quanto custa e quanto tempo leva cada serviço.

### 4. Configuração de Horários (`/admin/schedule`)
- **Horário de Funcionamento:** Definição de horários de abertura e fechamento para cada dia da semana.
- **Intervalos (Breaks):** Configuração de horários de almoço ou pausas técnicas.
- **Fechamento Excepcional:** Opção de marcar dias específicos como fechados (feriados, folgas).

### 5. Controle de Despesas (`/admin/expenses`)
- **Registro Financeiro:** Lançamento de gastos com materiais, aluguel, luz, etc.
- **Relatórios:** Visualização de totais por período e categoria.

---

## 💅 Área do Cliente (`/client`)

Focada na conveniência do cliente para gerenciar seus próprios agendamentos.

### 1. Login via OTP
- **Segurança e Simplicidade:** O cliente entra apenas com o número de telefone e recebe um código via SMS/WhatsApp (simulado no frontend).

### 2. Meus Agendamentos
- **Histórico e Próximos:** Visualização clara de todos os agendamentos realizados.
- **Cancelamento:** Opção de cancelar agendamentos com antecedência mínima configurada.

---

## 🌍 Área Pública (`/`)

O ponto de entrada para novos clientes.

### 1. Landing Page
- **Apresentação do Salão:** Serviços oferecidos, localização e diferenciais.

### 2. Fluxo de Reserva (Booking)
- **Seleção de Serviços:** Escolha de múltiplos serviços em um único agendamento.
- **Escolha de Data e Hora:** Visualização em tempo real dos horários disponíveis.
- **Confirmação:** Coleta de dados básicos do cliente para finalização da reserva.
