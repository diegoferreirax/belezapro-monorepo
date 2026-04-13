# 🪟 Padrão de Modais e Layouts

Este documento define os padrões visuais e estruturais para as modais (caixas de diálogo) utilizadas no projeto **BelezaPro**. Para manter a consistência de UI/UX e a reutilização de código, adotamos dois perfis principais na aplicação.

## 1. Modais de Formulário (`Padrão Base`)

Utilizadas para interações que exigem entrada de dados do usuário, como criação ou edição de entidades (ex: `ServiceModalComponent`).

### Características Visuais:
- **Dimensões:** Limitadas a `max-w-md` (largura média).
- **Moldura:** Cantos bem arredondados (`rounded-3xl` do Tailwind) e sombra profunda (`shadow-2xl`).
- **Fundo da Tela (Backdrop):** Escurecimento suave com desfoque de fundo (`bg-stone-900/40 backdrop-blur-sm`).
- **Animações (Entrada):** `animate-in fade-in zoom-in duration-200`.
- **Cabeçalho (Header):** Clean. Título à esquerda com tipografia sofisticada (`font-serif italic text-xl`) e um botão de fechar sem fundo à direita.
- **Botões de Ação:** Ocupam lagura proporcional (`flex-1`) com arredondamento padrão do sistema (`rounded-xl`).

---

## 2. Modais de Confirmação e Destrutivas (`Padrão Sofisticado`)

Utilizadas para ações irreversíveis ou críticas (ex: **Cancelar Agendamento** e **Deletar Serviço**). Estas modais ganharam um componente agnóstico e reaproveitável chamado `ConfirmModalComponent` (`/shared/components`).

### Características Visuais:
- **Cabeçalho Temático (Header Colorido):**
  - O cabeçalho possui um "fundo" temático (ex: `bg-rose-50` para vermelho/perigo ou `bg-stone-50` para neutro).
  - O ícone do contexto flutua destacado dentro de um círculo colorido à esquerda (ex: `bg-rose-100 text-rose-600`).
  - O título principal em serifado vem sempre acompanhado de um texto complementar (subtítulo) explicando a natureza da tela (ex: *"Ação irreversível."*).
- **Corpo (Body):**
  - Contém a mensagem descritiva primária (aceitando tags HTML como `<strong>` para dar ênfase no Alvo da ação).
  - **Box de Aviso (Warning Box):** Um contêiner estático de alerta, com layout macio (`bg-stone-50 rounded-2xl p-4`) e ícone, que força o usuário a ler as consequências antes de clicar sim.
- **Ações (Footer):**
  - Os botões rompem com a simetria da modal base. Eles são jogados p/ direita (`justify-end`).
  - O formato do botão muda de quadrado-arredondado para pílula (`rounded-full`).
  - Botão de confirmação possui ícone junto do texto e projeta uma forte sombra colorida (ex: `shadow-rose-500/30`), realçando que aquele é a zona de calor pro clique.

---

### Exemplo de Uso do `<app-confirm-modal>` Genérico

Caso você precise implementar uma nova ação destrutiva, não crie uma modal do zero. Importe o `ConfirmModalComponent` e configure suas flags:

```html
<app-confirm-modal
  [isOpen]="suaVariavelSignal()"
  title="Título Principal"
  subtitle="Subtítulo descritivo."
  icon="nome_do_icone_material"
  [message]="'Sua mensagem com <strong>suporte a negrito dinâmico</strong>.'"
  warningMessage="Mensagem secundária a ir dentro da Box protetora Cinza."
  cancelText="Texto Cancelar"
  confirmText="Texto Sucesso"
  confirmColor="rose" <!-- Pode ser "rose" (vermelho) ou "stone" (cinza) -->
  (closed)="funcaoDeFechar()"
  (confirmed)="funcaoExecutora()"
></app-confirm-modal>
```
