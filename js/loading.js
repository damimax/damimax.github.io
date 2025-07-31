// 加载动画控制
export class LoadingManager {
  constructor() {
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.isLoading = true;
  }

  // 初始化加载动画
  init() {
    // 确保加载动画在页面开始时显示
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'flex';
    }
  }

  // 隐藏加载动画
  hide() {
    if (this.loadingOverlay && this.isLoading) {
      this.isLoading = false;
      
      // 添加淡出动画
      this.loadingOverlay.classList.add('fade-out');
      
      // 动画结束后移除元素
      setTimeout(() => {
        if (this.loadingOverlay) {
          this.loadingOverlay.style.display = 'none';
        }
      }, 800);
    }
  }

  // 显示加载动画
  show() {
    if (this.loadingOverlay) {
      this.isLoading = true;
      this.loadingOverlay.classList.remove('fade-out', 'hidden');
      this.loadingOverlay.style.display = 'flex';
    }
  }

  // 检查页面是否完全加载
  checkPageLoaded() {
    return new Promise((resolve) => {
      // 检查DOM是否完全加载
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }

  // 模拟最小加载时间，确保用户体验
  async startWithMinLoadTime(minLoadTime = 1500) {
    const startTime = Date.now();
    
    // 等待页面加载完成
    await this.checkPageLoaded();
    
    // 计算还需要等待的时间
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadTime - elapsedTime);
    
    // 如果加载时间不足最小时间，则等待
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    // 隐藏加载动画
    this.hide();
  }
} 