# 🧪 Estratégia de Testes

Este documento descreve como garantimos a qualidade e estabilidade do **BelezaPro**.

## 🛠️ Ferramentas Utilizadas

- **Vitest:** O executor de testes principal, escolhido pela sua performance e integração nativa com o ecossistema Vite.
- **JSDOM:** Ambiente de simulação de DOM para testes de componentes.
- **Angular Testing Utilities:** `TestBed`, `ComponentFixture`, `getTestBed`.

## 📂 Organização dos Testes

Os testes unitários seguem o padrão de estarem localizados ao lado do arquivo que testam, com a extensão `.spec.ts`.
- Exemplo: `appointment-calendar.ts` -> `appointment-calendar.spec.ts`.

## 🚦 Como Rodar os Testes

Para rodar todos os testes uma única vez:
```bash
npm test
```

Para rodar em modo watch (desenvolvimento):
```bash
npx vitest
```

---

## 💡 Padrões e Melhores Práticas

### 1. Mocking de Serviços
Sempre utilize mocks para serviços core para isolar o componente que está sendo testado.
```ts
const mockSalonService = {
  getScheduleForDate: vi.fn().mockReturnValue({ ... }),
  scheduleConfigs: signal([])
};

await TestBed.configureTestingModule({
  providers: [
    { provide: SalonService, useValue: mockSalonService }
  ]
}).compileComponents();
```

### 2. Tratamento de `templateUrl` no Vitest
Como o Vitest não resolve arquivos externos automaticamente durante os testes de componentes, utilizamos o `TestBed.overrideComponent` para injetar o template HTML diretamente no spec.
- **Por que?** Isso evita erros de "Component not resolved" e permite que mantenhamos o padrão de arquivos separados (`.ts` e `.html`) no código-fonte.

### 3. Testando Signals
Ao testar componentes que usam Signals, lembre-se de usar `fixture.detectChanges()` para garantir que as mudanças de estado sejam refletidas na UI.
- Para inputs baseados em Signals, utilize `fixture.componentRef.setInput('nomeDoInput', valor)`.

### 4. Nomenclatura (Gherkin-style)
Preferimos descrever os testes de forma clara e legível:
- `describe('Nome do Componente', () => { ... })`
- `describe('Cenário ou Funcionalidade', () => { ... })`
- `it('deve fazer X quando Y acontecer', () => { ... })`

---

## 📈 Cobertura de Testes Atual
O foco atual dos testes está na lógica de negócio crítica:
- **`AppointmentCalendarComponent`**: Lógica de renderização de horários e posicionamento de agendamentos.
- **`ScheduleCalculatorService`**: Cálculos de disponibilidade e conflitos de horários.
- **`ExpenseService`**: Cálculos financeiros e chamadas HTTP (Vitest + `HttpTestingController`).
