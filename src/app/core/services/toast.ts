import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  createComponent,
  inject,
} from '@angular/core';
import { Toast } from '../../shared/components/toast';

/**
 * Notificações criadas dinamicamente com createComponent,
 * sem nenhum elemento fixo no template da aplicação.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private offset = 0;

  show(message: string): void {
    const ref = createComponent(Toast, { environmentInjector: this.injector });
    ref.setInput('message', message);
    ref.setInput('offset', this.offset);
    this.offset += 1;

    document.body.appendChild(ref.location.nativeElement);
    this.appRef.attachView(ref.hostView);

    setTimeout(() => {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
      this.offset = Math.max(0, this.offset - 1);
    }, 2600);
  }
}
