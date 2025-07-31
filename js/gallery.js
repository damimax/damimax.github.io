// 画廊功能模块
class Gallery {
  constructor(container, resources) {
    this.container = container;
    this.resources = resources;
    this.modal = null;
    this.currentVideo = null;
    this.init();
  }

  init() {
    this.createModal();
    this.renderGallery();
    this.initLazyLoading();
    this.bindEvents();
  }

  createModal() {
    // 创建弹框HTML
    const modalHTML = `
      <div class="modal-overlay" id="gallery-modal">
        <div class="modal-content">
          <button class="modal-close" id="modal-close">&times;</button>
          <div class="modal-media-container">
            <img class="modal-image" id="modal-image" style="display: none;">
            <video class="modal-video" id="modal-video" controls style="display: none;"></video>
          </div>
          <h3 class="modal-title" id="modal-title"></h3>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('gallery-modal');
    this.modalImage = document.getElementById('modal-image');
    this.modalVideo = document.getElementById('modal-video');
    this.modalTitle = document.getElementById('modal-title');
    this.modalClose = document.getElementById('modal-close');
  }

  renderGallery() {
    const galleryHTML = this.resources.map((resource, index) => {
      const fileType = this.getFileType(resource.thumbnail);
      const isVideo = fileType === 'video';
      const isDocument = fileType === 'document';
      const isUnsupported = fileType === 'unsupported';
      
      let mediaElement = '';
      let fileTypeBadge = '';
      
      if (isVideo) {
        mediaElement = `<video class="lazy-load" data-src="${resource.thumbnail}" muted loop></video>`;
        fileTypeBadge = '<span class="file-type video">视频</span>';
      } else if (isDocument) {
        mediaElement = `<div class="document-preview" style="height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1);">
          <div style="text-align: center; color: white;">
            <div style="font-size: 48px; margin-bottom: 10px;">📄</div>
            <div>${resource.name}</div>
          </div>
        </div>`;
        fileTypeBadge = '<span class="file-type document">文档</span>';
      } else if (isUnsupported) {
        mediaElement = `<div class="unsupported-preview" style="height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1);">
          <div style="text-align: center; color: white;">
            <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
            <div>${resource.name}</div>
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">格式不支持</div>
          </div>
        </div>`;
        fileTypeBadge = '<span class="file-type unsupported">不支持</span>';
      } else {
        mediaElement = `<img class="lazy-load" data-src="${resource.thumbnail}" alt="${resource.name}">`;
      }

      return `
        <div class="gallery-item" data-index="${index}" data-type="${fileType}">
          ${fileTypeBadge}
          ${mediaElement}
          <div class="item-overlay">
            <h4 class="item-title">${resource.name}</h4>
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = galleryHTML;
  }

  getFileType(url) {
    const extension = url.split('.').pop().toLowerCase();
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
      return 'video';
    } else if (['doc', 'docx', 'pdf', 'txt'].includes(extension)) {
      return 'document';
    } else if (['heic', 'heif'].includes(extension)) {
      return 'unsupported';
    } else {
      return 'image';
    }
  }

  initLazyLoading() {
    const lazyElements = this.container.querySelectorAll('.lazy-load');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const src = element.getAttribute('data-src');
          
          if (element.tagName === 'IMG') {
            element.src = src;
          } else if (element.tagName === 'VIDEO') {
            element.src = src;
          }
          
          element.addEventListener('load', () => {
            element.classList.add('loaded');
          });
          
          element.addEventListener('loadeddata', () => {
            element.classList.add('loaded');
          });
          
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: '50px'
    });

    lazyElements.forEach(element => {
      imageObserver.observe(element);
    });
  }

  bindEvents() {
    // 绑定画廊项点击事件
    this.container.addEventListener('click', (e) => {
      const galleryItem = e.target.closest('.gallery-item');
      if (galleryItem) {
        const index = parseInt(galleryItem.dataset.index);
        const resource = this.resources[index];
        this.openModal(resource, index);
      }
    });

    // 绑定弹框关闭事件
    this.modalClose.addEventListener('click', () => {
      this.closeModal();
    });

    // 点击弹框背景关闭
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // ESC键关闭弹框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  openModal(resource, index) {
    const fileType = this.getFileType(resource.thumbnail);
    
    this.modalTitle.textContent = resource.name;
    
    if (fileType === 'video') {
      this.modalImage.style.display = 'none';
      this.modalVideo.style.display = 'block';
      this.modalVideo.src = resource.thumbnail;
      this.currentVideo = this.modalVideo;
      this.modalVideo.play();
    } else if (fileType === 'document') {
      // 对于文档，直接下载或在新窗口打开
      window.open(resource.thumbnail, '_blank');
      return;
    } else if (fileType === 'unsupported') {
      // 对于不支持的文件格式，显示提示信息
      this.modalImage.style.display = 'none';
      this.modalVideo.style.display = 'none';
      this.modal.classList.add('active');
      return;
    } else {
      this.modalVideo.style.display = 'none';
      this.modalImage.style.display = 'block';
      this.modalImage.src = resource.thumbnail;
      this.currentVideo = null;
    }
    
    this.modal.classList.add('active');
  }

  closeModal() {
    this.modal.classList.remove('active');
    
    // 停止视频播放
    if (this.currentVideo) {
      this.currentVideo.pause();
      this.currentVideo.currentTime = 0;
      this.currentVideo = null;
    }
    
    // 清空媒体源
    this.modalImage.src = '';
    this.modalVideo.src = '';
  }
}

// 导出Gallery类
export { Gallery }; 