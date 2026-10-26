# Sonora

Player de música web construído com **Angular 21**. Permite montar uma biblioteca de faixas, organizá-las em playlists, favoritar músicas e ouvir tudo por uma barra de player persistente. Faixas podem ter como fonte um link de áudio ou um vídeo do YouTube.

## Funcionalidades

- **Biblioteca**: adicionar, listar e interagir com faixas (título, artista, álbum, duração e URL de áudio).
- **Playlists**: criar playlists e ver o detalhe de cada uma (`/playlists/:id`).
- **Favoritas**: lista das faixas marcadas como favoritas.
- **Barra do player**: play/pause, progresso, controle de volume.
- **Suporte a YouTube**: URLs `youtube.com`, `youtu.be`, `music.youtube.com`, embed e shorts são reconhecidas e tocadas via YouTube IFrame Player API.
- **Persistência local**: o estado é salvo no `localStorage` (chave `sonora.library.v2`).
- **Capas geradas**: a arte de cada faixa é gerada a partir de um matiz (`hue`).

## Tecnologias

- Angular 21 (componentes standalone, signals, rotas com `loadComponent` lazy)
- TypeScript 5.9
- RxJS 7.8
- CSS puro

## Como executar

Pré-requisitos: Node.js (compatível com Angular 21) e npm.

```bash
npm install
npm start        # servidor de desenvolvimento em http://localhost:4200
```

Outros scripts:

```bash
npm run build    # build de produção em dist/
npm run watch    # build contínuo em modo desenvolvimento
```

## Rotas

| Rota               | Descrição                  |
| ------------------ | -------------------------- |
| `/biblioteca`      | Biblioteca de faixas (padrão) |
| `/playlists`       | Lista de playlists         |
| `/playlists/:id`   | Detalhe de uma playlist    |
| `/favoritas`       | Faixas favoritas           |

## Arquitetura

O projeto segue o padrão **MVVM**: o estado vive em serviços (Model), cada feature tem um `*-viewmodel.ts` com a lógica de apresentação, e os templates apenas consomem o ViewModel.

```
src/app/
├── core/
│   ├── models/        # Track, Playlist
│   └── services/      # library-store (fonte única de verdade), player, toast, youtube-audio
├── features/
│   ├── library/
│   ├── playlists/
│   ├── playlist-detail/
│   ├── favorites/
│   └── player/        # barra do player
└── shared/
    ├── components/    # cover, icon, modal, toast, track-table
    ├── directives/    # autofocus, glow
    └── pipes/         # duration-pipe
```

O `LibraryStore` expõe o estado por signals somente leitura; mutações acontecem apenas por seus métodos.
