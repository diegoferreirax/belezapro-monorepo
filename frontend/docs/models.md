# 🗄️ Entidades e Modelos do Sistema

Este documento descreve as principais interfaces e modelos de dados do **BelezaPro**. Eles formam o coração das regras de negócio e estão centralizados no arquivo `src/app/core/models/salon.models.ts`. 

> 💡 **Nota de Migração Futura:** Esta modelagem já foi estruturada pensando em um banco de dados relacional. Toda a ramificação se apoia no acoplamento de chaves estrangeiras (`clientId`, `serviceIds`), o que facilitará diretamente a substituição do LocalStorage para serviços reais estruturados (como PostgreSQL ou MongoDB + Ref).

## 1. Clientes (`Client`)
Representa a base de usuários consolidados do salão.
- **`id`** (`string`): Identificador único (UUID) do cliente.
- **`name`** (`string`): Nome do cliente.
- **`email`** (`string`): Utilizado como chave de assinatura e contato.
- **`phone`** (`string`): Formato numérico, pilar da comunicação (SMS, Logins OTP via WhatsApp no futuro).
- **`isBlocked`** (`boolean?`): Opcional. Sinaliza se o cliente está na lista de exceção de agenda (banido por faltas graves/no-shows).

---

## 2. Serviços (`Service`)
Tipos de procedimentos ou produtos prestados. Um fluxo de usuário pode combinar $N$ serviços no mesmo agendamento.
- **`id`** (`string`): Identificador único (UUID).
- **`name`** (`string`): Título público do procedimento.
- **`price`** (`number`): Valor numérico total em Reais.
- **`durationMinutes`** (`number`): Duração estimada em minutos. É este campo, de todo o cardápio somado, que definirá as aberturas disponíveis no Calendário de Reservas.
- **`isActive`** (`boolean`): Flag de ocultação. `false` o remove da visão de reservas dos clientes sem precisar expurgar transações antigas no seu histórico financeiro (Soft Delete de visibilidade).

---

## 3. Agendamentos (`Appointment`)
A entidade pivô. Conecta `Client` a `Services` no cruzeiro temporal lógico gerado pela agenda.
- **`id`** (`string`): UUID do Agendamento.
- **`clientId`** (`string`): Chave-estrangeira apontando na coleção de `Client`.
- **`serviceIds`** (`string[]`): Coleção combinada de UUIDs (Muitos-para-Muitos em cascata flat) com procedimentos.
- **`date`** (`string`): Formato Data ISO (`YYYY-MM-DD`). Facilita filtragem e listagens de Dashboard sem parseamento de timezone complexo.
- **`startTime`** (`string`): Formato String `HH:mm`. Representa fielmente a que horas se iniciam os serviços.
- **`totalDurationMinutes`** (`number`): *Campo desnormalizado/Calculado*. O somatório puro das minutas de todos os `serviceIds` incluídos.
- **`totalPrice`** (`number`): O *Check-out*. Preenchido no instante de salvamento, guardando a quantia cobrada.
- **`status`** (`AppointmentStatus`): O Enum do fluxo de vivência da reserva.
   - `PENDING` (Pendente).
   - `CONFIRMED` (Confirmado e garantido na agenda).
   - `COMPLETED` (Finalizado, já se transformou em LTV do negócio).
   - `CANCELLED` (Lançado fora).

---

## 4. Matriz de Horários (`DayScheduleConfig` & `TimeRange`)
A mecânica de funcionamento. Um módulo robusto capaz de gerar matrizes padrão semanais e "Override Engines" unicamente para fins de feriados, folgas ou datas festivas.
- **`dayOfWeek`** (`number`): Numeração de controle cronológico, sendo `0` para Domingo até `6` para Sábado.
- **`date`** (`string?`): Atributo forte. Presente apenas em **exceções/overrides** de calendário (`YYYY-MM-DD`). Se este campo existir na tabela config, então as regras dele apagam a regra geral do `dayOfWeek`.
- **`startTime` / `endTime`** (`string`): Ponteiros de abertura e fechamento num dia (`HH:mm`).
- **`breaks`** (`TimeRange[]`): Coleção contendo blocos inoperantes (`start`, `end`). Por essas frinchas a Engine de Slot recusa alocar a `totalDurationMinutes` de novos Agendamentos. (Útil pra pausas café, almoço funcionário etc).
- **`isClosed`** (`boolean`): Dia de fechamento total (bloqueando cálculo do turno).

---

## 5. Despesas & Financeiro (`Expense`)
Usina paralela que baliza o fluxo de Caixa Saída do negócio, para subtrair das entradas dos `Appointments COMPLETED`.
- **`id`** (`string`): Identificador único.
- **`description`** (`string`): Natureza do gasto. O nome do recebedor (ex: "Equatorial Energia", "Mercantil").
- **`amount`** (`number`): Gravidade do gasto financeiro em Reais.
- **`date`** (`string`): Data que a depesa surgiu ou vencimento principal (`YYYY-MM-DD`).
- **`category`** (`ExpenseCategory`): Enum que empacota o modelo `Materiais`, `Aluguel`, `Utilidades (Luz/Água)`, `Marketing` ou `Outros`.
- **`isPaid`** (`boolean`): Diferencia relatórios baseados em **Fluxo de Caixa Rebaixado** (Real) vs. **Competência/Aprovisionado** (À Pagar).

---

## 6. Usuários do Sistema (`User`)
A camada de gestão e segurança do sistema. Representa os donos do salão e funcionários com nível de acesso ao Painel Admin, reaproveitando a nomenclatura padrão de "User".
- **`id`** (`string`): Identificador único (UUID) do funcionário.
- **`name`** (`string`): Nome de exibição na interface administrativa.
- **`email`** (`string`): Dado de contato corporativo do staff.
- **`username`** (`string`): Credencial utilizada explicitamente para o login.
- **`role`** (`string`): Diferencia 'admin' de 'client', garantindo escalabilidade nos níveis de acesso.
- **`password`** (`string?`): Atualmente mantida em texto nas chaves de `localStorage` para a fase de *mock/prova de conceito*. Em uma migração real de backend, **este campo deve obrigatoriamente** mudar seu tratamento para guardar apenas uma hash gerada por algoritmos de chave única (como *Bcrypt*).
