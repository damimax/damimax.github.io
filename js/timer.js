// timer.js
export const countdownTimer = {
  init: function () {
    const targetTime = new Date('2025-08-30T23:59:59').getTime();
    const boxes = document.querySelectorAll('.box');

    // 强制刷新函数，确保首次计算正确
    function forceUpdate() {
      const now = new Date().getTime();
      const diff = targetTime - now;
      if (diff <= 0) return;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const format = (num) => num.toString().padStart(2, '0');
      const timeValues = {
        days: format(days),
        hours: format(hours),
        minutes: format(minutes),
        seconds: format(seconds),
      };

      boxes.forEach((box) => {
        const target = box.dataset.target;
        const front = box.querySelector('.front');
        const back = box.querySelector('.back');
        front.textContent = timeValues[target];
        back.textContent = timeValues[target];
      });
    }

    function updateCountdown() {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        boxes.forEach((box) => {
          box.querySelector('.front').textContent = '00';
          box.querySelector('.back').textContent = '00';
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const format = (num) => num.toString().padStart(2, '0');
      const timeValues = {
        days: format(days),
        hours: format(hours),
        minutes: format(minutes),
        seconds: format(seconds),
      };

      boxes.forEach((box) => {
        const target = box.dataset.target;
        const front = box.querySelector('.front');
        const back = box.querySelector('.back');
        const current = front.textContent;
        const next = timeValues[target];

        if (current !== next) {
          box.classList.add('flip');
          requestAnimationFrame(() => {
            back.textContent = next;
            setTimeout(() => {
              front.textContent = next;
              box.classList.remove('flip');
            }, 600);
          });
        }
      });
    }

    // 首次加载时强制更新两次，确保覆盖初始状态
    forceUpdate();
    setTimeout(forceUpdate, 100); // 短延迟再次更新，避免计算误差

    // 启动定时更新
    setInterval(updateCountdown, 1000);
  },
};