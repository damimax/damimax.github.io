/**
 * 分享功能模块
 * 诱导用户使用浏览器原生分享功能
 */

class ShareManager {
  constructor() {
    this.shareData = {
      title: '郑州 · 龙湖熙上 | 二期合同交付倒计时',
      text: '时间正一分一秒地紧迫流逝，交付若不达标，我们绝不妥协，必捍卫合法权益。',
      url: window.location.href
    };
    
    this.init();
  }

  /**
   * 更新分享数据
   */
  updateShareData() {
    const remainingDays = this.getRemainingDays();
    
    // 动态生成标题，包含倒计时
    if (remainingDays > 0) {
      this.shareData.title = `郑州 · 龙湖熙上 | 二期合同交付倒计时 ${remainingDays} 天`;
      this.shareData.text = '时间正一分一秒地紧迫流逝，交付若不达标，我们绝不妥协，必捍卫合法权益。';
    } else {
      this.shareData.title = '郑州 · 龙湖熙上 | 二期合同交付期限已到';
      this.shareData.text = '时间正一分一秒地紧迫流逝，交付若不达标，我们绝不妥协，必捍卫合法权益。';
    }
  }

  init() {
    this.updateShareData();
    this.createShareButton();
    this.bindEvents();
    this.checkShareSupport();
    
    // 设置定时器，每分钟更新一次分享数据
    this.startShareDataTimer();
  }

  /**
   * 检查浏览器是否支持原生分享API
   */
  checkShareSupport() {
    try {
      return navigator.share && 
             typeof navigator.share === 'function' && 
             navigator.canShare && 
             typeof navigator.canShare === 'function' && 
             navigator.canShare(this.shareData);
    } catch (error) {
      return false;
    }
  }

  /**
   * 创建分享按钮
   */
  createShareButton() {
    // 检查是否应该显示分享按钮
    if (!this.shouldShowShareButton()) {
      return;
    }

    // 创建分享按钮容器
    const shareContainer = document.createElement('div');
    shareContainer.className = 'share-container';
    shareContainer.innerHTML = `
      <button class="share-btn" id="shareBtn">
        <svg class="share-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
        <span>分享</span>
      </button>
      <div class="share-tooltip" id="shareTooltip">
        <div class="tooltip-content">
          <div class="tooltip-title">分享给朋友</div>
          <div class="tooltip-desc" id="tooltipDesc">
            ${this.getRemainingDays() > 0 ? `距离交付日期仅剩 ${this.getRemainingDays()} 天，` : ''}让更多人了解项目进展
          </div>
          <div class="tooltip-actions">
            <button class="tooltip-btn primary" onclick="shareManager.nativeShare()">立即分享</button>
            <button class="tooltip-btn secondary" onclick="shareManager.hideTooltip()">稍后再说</button>
            <button class="tooltip-btn secondary" onclick="shareManager.hideShareButton()">隐藏按钮</button>
          </div>
        </div>
      </div>
    `;

    // 添加到页面
    document.body.appendChild(shareContainer);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const shareBtn = document.getElementById('shareBtn');
    const shareTooltip = document.getElementById('shareTooltip');
    
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showTooltip();
      });
    }

    // 点击外部关闭提示
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.share-container')) {
        this.hideTooltip();
      }
    });

    // 页面加载后延迟显示分享提示
    setTimeout(() => {
      this.showInitialPrompt();
    }, 3000);
  }

  /**
   * 显示分享提示
   */
  showTooltip() {
    const tooltip = document.getElementById('shareTooltip');
    if (tooltip) {
      tooltip.classList.add('show');
    }
  }

  /**
   * 隐藏分享提示
   */
  hideTooltip() {
    const tooltip = document.getElementById('shareTooltip');
    if (tooltip) {
      tooltip.classList.remove('show');
    }
  }

  /**
   * 获取剩余天数
   */
  getRemainingDays() {
    const targetTime = new Date('2025-08-30T23:59:59').getTime();
    const now = new Date().getTime();
    const diff = targetTime - now;
    
    if (diff <= 0) return 0;
    
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * 检查是否应该显示重要提醒
   */
  shouldShowImportantPrompt() {
    const remainingDays = this.getRemainingDays();
    return remainingDays <= 15 && remainingDays > 0;
  }

  /**
   * 初始分享提示
   */
  showInitialPrompt() {
    // 检查是否应该显示重要提醒
    if (!this.shouldShowImportantPrompt()) {
      return;
    }

    // 检测浏览器环境
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isInApp = this.isInAppBrowser();
    const hasShareSupport = this.checkShareSupport();

    let promptMessage = `
      时间正一分一秒地紧迫流逝，交付若不达标，我们绝不妥协，必捍卫合法权益。
      <br><br>
      距离交付日期仅剩 ${this.getRemainingDays()} 天，请分享给更多业主，共同关注项目进展！
    `;

    let buttonText = '立即分享';

    // 根据环境调整提示内容
    if (isMobile && isInApp) {
      promptMessage = `
        时间正一分一秒地紧迫流逝，交付若不达标，我们绝不妥协，必捍卫合法权益。
        <br><br>
        距离交付日期仅剩 ${this.getRemainingDays()} 天，当前在应用内浏览器中，建议在浏览器中打开后点击右下角分享按钮。
      `;
      buttonText = '在浏览器中打开';
    } else if (isMobile && !hasShareSupport) {
      promptMessage = `
        时间正一分一秒地紧迫流逝，交付若不达标，我们绝不妥协，必捍卫合法权益。
        <br><br>
        距离交付日期仅剩 ${this.getRemainingDays()} 天，请复制链接分享给更多业主，共同关注项目进展！
      `;
      buttonText = '复制链接';
    }

    // 创建初始提示
    const initialPrompt = document.createElement('div');
    initialPrompt.className = 'initial-share-prompt';
    initialPrompt.innerHTML = `
      <div class="prompt-content">
        <div class="prompt-icon">📢</div>
        <div class="prompt-title">重要提醒</div>
        <div class="prompt-message" id="initialPromptMessage">
          ${promptMessage}
        </div>
        <div class="prompt-actions">
          <button class="prompt-btn primary" onclick="shareManager.handleInitialShare()">${buttonText}</button>
          <button class="prompt-btn secondary" onclick="shareManager.dismissPrompt()">我知道了</button>
        </div>
      </div>
    `;

    document.body.appendChild(initialPrompt);
    
    // 10秒后自动消失
    setTimeout(() => {
      this.dismissPrompt();
    }, 10000);
  }

  /**
   * 处理初始分享按钮点击
   */
  handleInitialShare() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isInApp = this.isInAppBrowser();
    const hasShareSupport = this.checkShareSupport();

    if (isMobile && isInApp) {
      // 在应用内浏览器中，显示浏览器提示
      this.dismissPrompt();
      this.showBrowserPrompt();
    } else if (isMobile && !hasShareSupport) {
      // 移动端但不支持原生分享，复制链接
      this.dismissPrompt();
      this.useClipboard();
    } else {
      // 其他情况，尝试原生分享
      this.nativeShare();
    }
  }

  /**
   * 关闭初始提示
   */
  dismissPrompt() {
    const prompt = document.querySelector('.initial-share-prompt');
    if (prompt) {
      prompt.remove();
      localStorage.setItem('sharePromptShown', 'true');
    }
  }

  /**
   * 原生分享功能 - 改进版本
   */
  async nativeShare() {
    // 首先检查是否在微信内浏览器
    if (this.isInWeChat()) {
      this.handleWeChatShare();
      return;
    }

    try {
      if (this.checkShareSupport()) {
        // 添加分享状态跟踪
        this.setShareState('sharing');
        
        await navigator.share(this.shareData);
        
        // 分享成功
        this.setShareState('success');
        this.showSuccessMessage();
      } else {
        this.fallbackShare();
      }
    } catch (error) {
      console.log('分享被取消或出错:', error);
      
      // 重置分享状态
      this.setShareState('idle');
      
      // 如果是用户取消，不显示错误
      if (error.name !== 'AbortError') {
        this.fallbackShare();
      }
    }
  }

  /**
   * 处理微信内分享
   */
  handleWeChatShare() {
    // 在微信内，直接显示浏览器提示
    this.showWeChatBrowserPrompt();
  }

  /**
   * 显示微信浏览器提示
   */
  showWeChatBrowserPrompt() {
    const modal = document.createElement('div');
    modal.className = 'link-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>微信内分享提示</h3>
          <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="browser-prompt">
            <div class="prompt-icon">📱</div>
            <div class="prompt-title">当前在微信内浏览器</div>
            <div class="prompt-desc">
              微信内浏览器分享功能受限，建议在系统浏览器中打开后分享。
            </div>
            <div class="share-methods">
              <div class="method-item">
                <div class="method-icon">🌐</div>
                <div class="method-text">
                  <strong>方法一:</strong> 点击右上角 ⋯ → 在浏览器中打开 → 点击右下角分享按钮
                </div>
              </div>
              <div class="method-item">
                <div class="method-icon">📋</div>
                <div class="method-text">
                  <strong>方法二:</strong> 复制链接到系统浏览器打开后分享
                </div>
              </div>
              <div class="method-item">
                <div class="method-icon">📤</div>
                <div class="method-text">
                  <strong>方法三:</strong> 直接复制链接分享给朋友
                </div>
              </div>
            </div>
            <div class="browser-steps">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-text">点击右上角菜单按钮</div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-text">选择"在浏览器中打开"</div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-text">在浏览器中点击右下角分享按钮</div>
              </div>
            </div>
            <div class="link-container">
              <input type="text" value="${window.location.href}" readonly id="shareLink">
              <button onclick="shareManager.copyLink()">复制链接</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * 设置分享状态
   */
  setShareState(state) {
    this.shareState = state;
    // 可以在这里添加状态变化的处理逻辑
  }

  /**
   * 备用分享方案
   */
  fallbackShare() {
    // 检查是否在移动端浏览器中
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isInApp = this.isInAppBrowser();
    
    if (isMobile && !isInApp) {
      // 移动端但不在应用内浏览器，提示在浏览器中打开
      this.showBrowserPrompt();
    } else {
      // 桌面端或在应用内浏览器，使用剪贴板
      this.useClipboard();
    }
  }

  /**
   * 检测是否在应用内浏览器
   */
  isInAppBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('micromessenger') || // 微信
           userAgent.includes('weibo') || // 微博
           userAgent.includes('qq/') || // QQ
           userAgent.includes('alipay') || // 支付宝
           userAgent.includes('dingtalk') || // 钉钉
           userAgent.includes('feishu') || // 飞书
           userAgent.includes('lark') || // 飞书
           userAgent.includes('wework') || // 企业微信
           userAgent.includes('douyin') || // 抖音
           userAgent.includes('toutiao'); // 头条
  }

  /**
   * 检测是否在微信内浏览器
   */
  isInWeChat() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('micromessenger');
  }

  /**
   * 显示浏览器提示
   */
  showBrowserPrompt() {
    const modal = document.createElement('div');
    modal.className = 'link-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>在浏览器中打开</h3>
          <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="browser-prompt">
            <div class="prompt-icon">🌐</div>
            <div class="prompt-title">请在浏览器中打开</div>
            <div class="prompt-desc">
              当前在应用内浏览器中，无法使用分享功能。<br>
              请在浏览器中打开后，点击右下角的分享按钮进行分享。
            </div>
            <div class="share-methods">
              <div class="method-item">
                <div class="method-icon">📱</div>
                <div class="method-text">
                  <strong>微信/QQ:</strong> 点击右上角 ⋯ → 在浏览器中打开 → 点击右下角分享按钮
                </div>
              </div>
              <div class="method-item">
                <div class="method-icon">📱</div>
                <div class="method-text">
                  <strong>微博/抖音:</strong> 点击右上角 ⋯ → 在浏览器中打开 → 点击右下角分享按钮
                </div>
              </div>
              <div class="method-item">
                <div class="method-icon">📱</div>
                <div class="method-text">
                  <strong>其他应用:</strong> 复制链接到浏览器打开 → 点击右下角分享按钮
                </div>
              </div>
            </div>
            <div class="browser-steps">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-text">点击右上角菜单按钮</div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-text">选择"在浏览器中打开"</div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-text">在浏览器中点击右下角分享按钮</div>
              </div>
            </div>
            <div class="link-container">
              <input type="text" value="${window.location.href}" readonly id="shareLink">
              <button onclick="shareManager.copyLink()">复制链接</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * 使用剪贴板复制
   */
  useClipboard() {
    // 检查剪贴板API是否可用
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.showCopySuccess();
      }).catch(() => {
        // 如果剪贴板API不可用，显示链接
        this.showLinkModal();
      });
    } else {
      // 如果剪贴板API不可用，直接显示链接
      this.showLinkModal();
    }
  }

  /**
   * 显示分享成功消息
   */
  showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'share-success-message';
    message.innerHTML = `
      <div class="success-content">
        <div class="success-icon">✅</div>
        <div class="success-text">分享成功！感谢您的支持</div>
      </div>
    `;

    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  /**
   * 显示复制成功消息
   */
  showCopySuccess() {
    const message = document.createElement('div');
    message.className = 'share-success-message';
    message.innerHTML = `
      <div class="success-content">
        <div class="success-icon">📋</div>
        <div class="success-text">链接已复制到剪贴板</div>
      </div>
    `;

    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  /**
   * 显示链接模态框
   */
  showLinkModal() {
    const modal = document.createElement('div');
    modal.className = 'link-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>分享链接</h3>
          <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="modal-body">
          <p>请复制以下链接分享给朋友：</p>
          <div class="link-container">
            <input type="text" value="${window.location.href}" readonly id="shareLink">
            <button onclick="shareManager.copyLink()">复制</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * 复制链接
   */
  copyLink() {
    const linkInput = document.getElementById('shareLink');
    if (linkInput) {
      linkInput.select();
      
      // 尝试使用现代剪贴板API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkInput.value).then(() => {
          this.showCopySuccess();
        }).catch(() => {
          // 降级到传统方法
          this.fallbackCopy();
        });
      } else {
        // 使用传统方法
        this.fallbackCopy();
      }
    }
  }

  /**
   * 传统复制方法
   */
  fallbackCopy() {
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showCopySuccess();
      } else {
        // 如果复制失败，显示提示
        this.showCopyError();
      }
    } catch (err) {
      // 如果复制失败，显示提示
      this.showCopyError();
    }
  }

  /**
   * 显示复制失败消息
   */
  showCopyError() {
    const message = document.createElement('div');
    message.className = 'share-success-message';
    message.innerHTML = `
      <div class="success-content">
        <div class="success-icon">⚠️</div>
        <div class="success-text">请手动复制链接</div>
      </div>
    `;

    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  /**
   * 隐藏分享按钮
   */
  hideShareButton() {
    const shareContainer = document.querySelector('.share-container');
    if (shareContainer) {
      shareContainer.style.display = 'none';
      this.hideTooltip();
    }
  }

  /**
   * 启动分享数据定时器
   */
  startShareDataTimer() {
    // 每分钟更新一次分享数据
    setInterval(() => {
      this.updateShareData();
      this.updateTooltipDisplay();
    }, 60000); // 60秒 = 1分钟
  }

  /**
   * 更新提示框显示
   */
  updateTooltipDisplay() {
    const tooltipDesc = document.getElementById('tooltipDesc');
    if (tooltipDesc) {
      const remainingDays = this.getRemainingDays();
      tooltipDesc.innerHTML = `${remainingDays > 0 ? `距离交付日期仅剩 ${remainingDays} 天，` : ''}让更多人了解项目进展`;
    }
    
    // 更新初始提示的显示
    const initialPromptMessage = document.getElementById('initialPromptMessage');
    if (initialPromptMessage) {
      const remainingDays = this.getRemainingDays();
      const promptMessage = `
        时间正一分一秒地紧迫流逝，交付若不达标，我们绝不妥协，必捍卫合法权益。
        <br><br>
        距离交付日期仅剩 ${remainingDays} 天，请分享给更多业主，共同关注项目进展！
      `;
      initialPromptMessage.innerHTML = promptMessage;
    }
  }

  /**
   * 检查是否应该显示分享按钮
   */
  shouldShowShareButton() {
    return true; // 总是显示分享按钮，刷新页面后重新显示
  }


}

// 创建全局分享管理器实例
let shareManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  shareManager = new ShareManager();
});

// 导出到全局作用域
window.shareManager = shareManager; 