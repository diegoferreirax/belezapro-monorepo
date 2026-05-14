import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalShellComponent {
  /** `md` = formulário padrão; `lg` = fluxos largos (ex.: agendamento). */
  @Input() size: 'md' | 'lg' = 'md';
  /** `max-h-[90vh]` + coluna para modais com corpo rolável. */
  @Input() tall = false;
  /** `muted` = bg-stone-900/40; `emphasis` = /60 (confirmações). */
  @Input() backdrop: 'muted' | 'emphasis' = 'muted';
  @Input() closeOnBackdrop = false;
  @Output() backdropDismiss = new EventEmitter<void>();

  onBackdropMouseDown(ev: MouseEvent): void {
    if (
      this.closeOnBackdrop &&
      ev.target instanceof Node &&
      ev.currentTarget instanceof Node &&
      ev.target === ev.currentTarget
    ) {
      this.backdropDismiss.emit();
    }
  }
}
