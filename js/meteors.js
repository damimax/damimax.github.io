// meteors.js
export const meteorEffect = {
  init: function () {
    const isMobile = window.innerWidth < 768;
    const meteorContainer = document.querySelector('.meteor-container');
    const meteorCount = isMobile ? 2 : 3;

    function createMeteor() {
      const meteor = document.createElement('div');
      meteor.classList.add('meteor');
      const startX = Math.random() * window.innerWidth;
      const angle = 30 + Math.random() * 20;
      const duration = 1 + Math.random() * 2;

      meteor.style.top = `-${Math.random() * 50 + 20}px`;
      meteor.style.left = `${startX}px`;
      meteor.style.transform = `rotate(${angle}deg)`;
      meteorContainer.appendChild(meteor);

      setTimeout(() => {
        meteor.style.opacity = '1';
        meteor.style.transform = `rotate(${angle}deg) translateY(${
          window.innerHeight * 1.2
        }px)`;
        meteor.style.transition = `transform ${duration}s linear, opacity ${
          duration * 0.8
        }s ease-out`;
      }, 10);

      setTimeout(() => {
        meteor.style.opacity = '0';
        setTimeout(() => meteor.remove(), 1000);
      }, duration * 1000);
    }

    function startMeteors() {
      for (let i = 0; i < meteorCount; i++) {
        setTimeout(createMeteor, i * 1000);
      }
      // 调整流星生成频率，使效果更流畅
      setInterval(() => {
        if (document.querySelectorAll('.meteor').length < meteorCount * 2) {
          createMeteor();
        }
      }, 1500);
    }

    startMeteors();
  },
};