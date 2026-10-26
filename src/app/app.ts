import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LibraryStore } from './core/services/library-store';
import { PlayerBar } from './features/player/player-bar';
import { Icon } from './shared/components/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PlayerBar, Icon],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly store = inject(LibraryStore);
  protected readonly playlists = this.store.playlists;
}
