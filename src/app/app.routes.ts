import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'biblioteca' },
  {
    path: 'biblioteca',
    title: 'Sonora · Biblioteca',
    loadComponent: () => import('./features/library/library').then((m) => m.Library),
  },
  {
    path: 'playlists',
    title: 'Sonora · Playlists',
    loadComponent: () => import('./features/playlists/playlists').then((m) => m.Playlists),
  },
  {
    path: 'playlists/:id',
    title: 'Sonora · Playlist',
    loadComponent: () =>
      import('./features/playlist-detail/playlist-detail').then((m) => m.PlaylistDetail),
  },
  {
    path: 'favoritas',
    title: 'Sonora · Favoritas',
    loadComponent: () => import('./features/favorites/favorites').then((m) => m.Favorites),
  },
  { path: '**', redirectTo: 'biblioteca' },
];
