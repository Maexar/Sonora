import { Component, effect, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cover } from '../../shared/components/cover';
import { Icon } from '../../shared/components/icon';
import { Modal } from '../../shared/components/modal';
import { TrackTable } from '../../shared/components/track-table';
import { AutofocusDirective } from '../../shared/directives/autofocus';
import { DurationPipe } from '../../shared/pipes/duration-pipe';
import { PlaylistDetailViewModel } from './playlist-detail-viewmodel';

@Component({
  selector: 'app-playlist-detail',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TrackTable,
    Modal,
    Cover,
    Icon,
    DurationPipe,
    AutofocusDirective,
  ],
  providers: [PlaylistDetailViewModel],
  templateUrl: './playlist-detail.html',
  styleUrl: './playlist-detail.css',
})
export class PlaylistDetail {
  /** Preenchido pelo roteador via withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly vm = inject(PlaylistDetailViewModel);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => this.vm.setId(this.id()));
  }

  protected openEdit(): void {
    const playlist = this.vm.playlist();
    if (!playlist) return;
    this.form.setValue({ name: playlist.name, description: playlist.description });
    this.vm.editOpen.set(true);
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.vm.rename(value.name, value.description);
  }

  protected gradient(hue: number): string {
    return `linear-gradient(140deg, hsl(${hue} 62% 52%), hsl(${(hue + 50) % 360} 70% 30%))`;
  }
}
