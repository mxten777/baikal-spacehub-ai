// Injected by vite.config.ts → define.__APP_VERSION__
declare const __APP_VERSION__: string

// YouTube IFrame Player API
declare namespace YT {
  interface PlayerState {
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  }

  interface PlayerEvent {
    data: number;
    target: Player;
  }

  interface PlayerOptions {
    videoId?: string;
    width?: string | number;
    height?: string | number;
    playerVars?: {
      autoplay?: 0 | 1;
      rel?: 0 | 1;
      playsinline?: 0 | 1;
    };
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: PlayerEvent) => void;
    };
  }

  class Player {
    constructor(element: HTMLElement | string, options: PlayerOptions);
    stopVideo(): void;
    destroy(): void;
    getIframe(): HTMLIFrameElement;
  }
}

interface Window {
  YT?: {
    Player: typeof YT.Player;
    PlayerState: YT.PlayerState;
  };
  onYouTubeIframeAPIReady?: () => void;
}
