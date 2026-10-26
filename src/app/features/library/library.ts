import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Track } from '../../core/models/track';
import { Icon } from '../../shared/components/icon';
import { Modal } from '../../shared/components/modal';
import { TrackTable } from '../../shared/components/track-table';
import { AutofocusDirective } from '../../shared/directives/autofocus';
import { DurationPipe } from '../../shared/pipes/duration-pipe';
import { LibrarySort, LibraryViewModel } from './library-viewmodel';

@Component({
  selector: 'app-library',
  imports: [ReactiveFormsModule, TrackTable, Modal, Icon, DurationPipe, AutofocusDirective],
  providers: [LibraryViewModel],
  templateUrl: './library.html',
  styleUrl: './library.css',
})
export class Library {
  protected readonly vm = inject(LibraryViewModel);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    artist: ['', Validators.required],
    album: [''],
    minutes: [3, [Validators.required, Validators.min(0), Validators.max(99)]],
    seconds: [30, [Validators.required, Validators.min(0), Validators.max(59)]],
    audioUrl: [''],
  });

  protected onSearch(event: Event): void {
    this.vm.search.set((event.target as HTMLInputElement).value);
  }

  protected onSort(event: Event): void {
    this.vm.sort.set((event.target as HTMLSelectElement).value as LibrarySort);
  }

  protected openCreate(): void {
    this.form.reset();
    this.vm.openCreate();
  }

  protected openEdit(track: Track): void {
    this.form.setValue({
      title: track.title,
      artist: track.artist,
      album: track.album,
      minutes: Math.floor(track.duration / 60),
      seconds: track.duration % 60,
      audioUrl: track.audioUrl ?? '',
    });
    this.vm.openEdit(track);
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.vm.save({
      title: value.title.trim(),
      artist: value.artist.trim(),
      album: value.album.trim() || 'Single',
      duration: value.minutes * 60 + value.seconds,
      audioUrl: value.audioUrl.trim() || undefined,
    });
  }
}
