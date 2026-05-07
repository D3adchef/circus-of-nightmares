const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  width: 1152,
  height: 576,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [
    EntranceScene,
    MirrorScene,
    StorageScene,
    DressingScene,
    ExitScene,
    EntrancePostGameScene,
    WinnerScene,
    LairScene
  ]
};

window.GameTimer = {
  start: null,
  total: 600000,
  getRemaining: function () {
    if (!this.start) return this.total;
    return Math.max(0, this.total - (Date.now() - this.start));
  }
};

const game = new Phaser.Game(config);

// DOM LED clock — DOMContentLoaded ensures the timer div exists before we grab it
document.addEventListener('DOMContentLoaded', function () {
  const timerEl   = document.getElementById('game-timer');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  setInterval(function () {
    const remaining = window.GameTimer.getRemaining();
    const totalSec  = Math.floor(remaining / 1000);
    const minutes   = Math.floor(totalSec / 60);
    const seconds   = totalSec % 60;

    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');

    timerEl.classList.remove('warning', 'danger');
    if (totalSec <= 30) {
      timerEl.classList.add('danger');
    } else if (totalSec <= 120) {
      timerEl.classList.add('warning');
    }
  }, 200);
});