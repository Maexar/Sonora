import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/components/icon';
import { Modal } from '../../shared/components/modal';
import { AutofocusDirective } from '../../shared/directives/autofocus';
import { GlowDirective } from '../../shared/directives/glow';
import { DurationPipe } from '../../shared/pipes/duration-pipe';
import { PlaylistsViewModel } from './playlists-viewmodel';

@Component({
  selector: 'app-playlists',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    Modal,
    Icon,
    DurationPipe,
    AutofocusDirective,
    GlowDirective,
  ],
  providers: [PlaylistsViewModel],
  templateUrl: './playlists.html',
  styleUrl: './playlists.css',
})
export class Playlists {
  protected readonly vm = inject(PlaylistsViewModel);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  protected openCreate(): void {
    this.form.reset();
    this.vm.createOpen.set(true);
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.vm.create(value.name, value.description);
  }

  protected gradient(hue: number): string {
    return `linear-gradient(140deg, hsl(${hue} 62% 52%), hsl(${(hue + 50) % 360} 70% 30%))`;
  }
}
