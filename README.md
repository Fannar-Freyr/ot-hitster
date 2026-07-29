# OT Hitster

A Hitster + Jackbox game. Built with [Next.js](https://nextjs.org/docs), [Supabase](https://supabase.com/docs) and [Spotify API](https://developer.spotify.com/documentation/web-api).

## Playing

- The DJ goes to `/create-game` and logs into Spotify
- Selects a playlist and number of points required to win
- Clicks "Create a game"
- A screen with the game code is displayed
- Users input that game code on the index page along with a team name
- Then just click start and hit next until someone wins

Note on playlists: Make sure that you use the original release for each song. The release date is gotten from the album release date, so if the song is from a compilation/best of/re-release then the date could be wrong (I think it is sometimes correct but I ran into this a few times while testing the game)

## Getting started developing

Run the development server with `npm run dev`

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These values can be found in your Supabase project settings under API.

## Supabase

Supabase provides the Postgres database for this project and handles the Spotify login.

Project URL and publishable key need to be set in the `.env` file.

### Database Schema

The main tables and their relationships:

- **games** - Game instances with metadata (code, dj_id, playlist_id, points_to_win, status)
- **players** - Players/teams in a game (name, team_color, score, is_dj)
- **rounds** - Individual rounds within a game (round_number, song_id, status)
- **songs** - Song data fetched from Spotify (spotify_id, title, artist, year, album_art)
- **guesses** - Player guesses for each round (player_id, round_id, guess_range, correct)
- **songOwners** - Tracks which players have correctly guessed songs (player_id, song_id)

TODO: Make it easy to set up the tables on a new Supabase account

## Spotify

The project is tied to Olavstoppen's Spotify account. It has an app set up in development mode called "ot hitster".

Spotify limits the number of accounts that can access the APIs to 5, which can be added or removed in the Spotify developer dashboard.

The APIs being used:

- Web Playback API ([docs](https://developer.spotify.com/documentation/web-playback-sdk))
  - Used for playing songs
- Web API ([docs](https://developer.spotify.com/documentation/web-api))
  - Used for fetching data about everything else (playlists, tracks etc.)

## Project structure

```
ot-hitster/
├── app/ # Next.js app directory
│ ├── create-game/
│ └── game/
├── components/
│ └── [screens]/
├── context/
├── hooks/
└── utils/
  └── db/
```

There are three pages:

- `/`
  - Where the player/team logs into a game
- `/game`
  - Where the whole game takes place
- `/create-game`
  - Where the DJ creates a game

In `/components/` are subfolders for each game screen: lobby, guessing, reveal, leaderboard and gameOver. Each of those has at least one component that is rendered on the DJ screen and sometimes another that is rendered on the player's device.

For example the guessing screen has `GuessingScreen.tsx` and `GuessingPlayer.tsx`

The flow of the game is handled by `/utils/gameManager.ts`.

- There is a call on each of the "DJ screens" to the function `handleGameStatusChange`.

## Styling

The project uses [Tailwind](https://tailwindcss.com/docs) for styling and [Motion](https://motion.dev/docs/react-animation) for animations. Gradient background uses [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) in a Canvas element with colors extracted from album artwork with [Color Thief](https://lokeshdhakar.com/projects/color-thief/).

## Deployment

The repository is currently set up to deploy on Vercel when changes are pushed to the `main` branch.

https://ot-hitster.vercel.app/

TODO: It's currently tied to my (Fannar) Vercel account. Either move it to another account or just have whoever is working on the project set up their own Vercel account or other deployment service.
