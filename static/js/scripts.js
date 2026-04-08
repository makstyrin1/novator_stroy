// Инициализация AOS анимаций
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
}

// ========================================
// ФУНКЦИИ ДЛЯ EMAIL (TOAST УВЕДОМЛЕНИЯ)
// ========================================

// Функция показа уведомления
function showToast(message, isError = false) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    if (isError) toast.classList.add('error');
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

// Показываем email для ручного копирования
function showToastWithEmail(email) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a2e;
        color: #fff;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 16px;
        z-index: 9999;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.2);
        backdrop-filter: blur(10px);
        max-width: 90%;
        pointer-events: none;
    `;
    toast.innerHTML = `
        <div style="margin-bottom: 8px;">📧 Наш email:</div>
        <div style="font-size: 18px; font-weight: bold; color: #4CAF50;">${email}</div>
        <div style="font-size: 12px; margin-top: 8px;">Нажмите и удерживайте, чтобы скопировать</div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Fallback метод копирования
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    textarea.style.zIndex = '-9999';
    
    document.body.appendChild(textarea);
    
    textarea.value = text;
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error('Ошибка копирования:', err);
    }
    
    document.body.removeChild(textarea);
    
    if (success) {
        showToast('✓ Email скопирован!');
    } else {
        showToastWithEmail(text);
    }
}

// Глобальная функция copyEmail
window.copyEmail = function(event) {
    if (event) event.preventDefault();
    const email = "kosty161288@icloud.com";
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function() {
            showToast('✓ Email скопирован!');
        }).catch(function() {
            fallbackCopy(email);
        });
    } else {
        fallbackCopy(email);
    }
    
    return false;
};

// ========================================
// ФИЛЬТРАЦИЯ УСЛУГ (С ХРАНЕНИЕМ ВСЕХ ДАННЫХ)
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    const servicesGrid = document.getElementById('servicesGrid');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    
    // Получаем все услуги из скрытого JSON
    let allServices = [];
    const servicesDataScript = document.getElementById('allServicesData');
    if (servicesDataScript) {
        try {
            allServices = JSON.parse(servicesDataScript.innerHTML);
        } catch(e) {
            console.error('Ошибка парсинга данных услуг:', e);
        }
    }
    
    if (!filterButtons.length || !servicesGrid) return;
    
    // Функция рендеринга карточек услуг
    function renderServices(servicesToRender) {
        if (!servicesGrid) return;
        
        if (servicesToRender.length === 0) {
            servicesGrid.innerHTML = '<div class="no-services"><p>В этой категории пока нет услуг</p></div>';
            return;
        }
        
        let html = '';
        servicesToRender.forEach((service, index) => {
            html += `
            <div class="service-card" data-category-id="${service.category_id}" data-aos="fade-up" data-aos-delay="${(index % 6) * 100}">
                <div class="service-image">
                    <img src="${service.image}" alt="${service.title}">
                    <div class="service-overlay">
                        <span class="service-category">${service.category_title}</span>
                    </div>
                </div>
                <div class="service-info">
                    <h3>${service.title}</h3>
                    <p>${service.short_description}</p>
                    <div class="service-price">
                        <span class="price">${new Intl.NumberFormat('ru-RU').format(service.price)}<small>₽</small></span>
                        <span class="unit">${service.price_unit || ''}</span>
                    </div>
                    <a href="${service.url}" class="btn-detail">
                        Подробнее <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
            `;
        });
        
        servicesGrid.innerHTML = html;
        
        // Переинициализируем AOS для новых элементов
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
    
    // Функция фильтрации
    function filterServices(categoryId, categoryName, updateUrl = true) {
        let filteredServices = [];
        
        if (categoryId === 'all') {
            filteredServices = allServices;
        } else {
            filteredServices = allServices.filter(service => service.category_id == categoryId);
        }
        
        // Рендерим отфильтрованные услуги
        renderServices(filteredServices);
        
        // Обновляем заголовки
        if (sectionTitle && sectionSubtitle) {
            if (categoryId === 'all') {
                sectionTitle.textContent = 'Наши услуги';
                sectionSubtitle.textContent = 'Профессиональные решения для любых задач';
            } else {
                sectionTitle.textContent = categoryName;
                sectionSubtitle.textContent = categoryName.toLowerCase() + ' от профессионалов';
            }
        }
        
        // Обновляем URL без перезагрузки
        if (updateUrl) {
            if (categoryId === 'all') {
                window.history.pushState({ category: 'all' }, '', '/services/');
            } else {
                window.history.pushState({ category: categoryId }, '', `/services/category/${categoryId}/`);
            }
        }
    }
    
    // Обработчик клика по кнопкам фильтров
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const categoryId = this.getAttribute('data-category-id');
            const categoryName = this.getAttribute('data-category-name');
            
            // Меняем активный класс
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Вызываем фильтрацию
            filterServices(categoryId, categoryName, true);
        });
    });
    
    // Обработчик кнопки "Назад/Вперед" в браузере
    window.addEventListener('popstate', function(event) {
        const currentPath = window.location.pathname;
        let activeCategoryId = 'all';
        let activeCategoryName = 'all';
        
        if (currentPath.includes('/services/category/')) {
            const match = currentPath.match(/\/category\/(\d+)/);
            if (match) {
                activeCategoryId = match[1];
                const activeBtn = document.querySelector(`.filter-btn[data-category-id="${activeCategoryId}"]`);
                if (activeBtn) {
                    activeCategoryName = activeBtn.getAttribute('data-category-name');
                    // Обновляем активную кнопку
                    filterButtons.forEach(btn => {
                        const btnId = btn.getAttribute('data-category-id');
                        if (btnId === activeCategoryId) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }
            }
        } else {
            // На странице "Все услуги"
            filterButtons.forEach(btn => {
                const btnId = btn.getAttribute('data-category-id');
                if (btnId === 'all') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        // Применяем фильтр
        filterServices(activeCategoryId, activeCategoryName, false);
    });
    
    // Определяем начальную категорию из URL при загрузке
    const currentPath = window.location.pathname;
    let initialCategoryId = 'all';
    let initialCategoryName = 'all';
    
    if (currentPath.includes('/services/category/')) {
        const match = currentPath.match(/\/category\/(\d+)/);
        if (match) {
            initialCategoryId = match[1];
            const activeBtn = document.querySelector(`.filter-btn[data-category-id="${initialCategoryId}"]`);
            if (activeBtn) {
                initialCategoryName = activeBtn.getAttribute('data-category-name');
                // Устанавливаем активную кнопку
                filterButtons.forEach(btn => {
                    const btnId = btn.getAttribute('data-category-id');
                    if (btnId === initialCategoryId) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        }
    }
    
    // Применяем начальную фильтрацию
    filterServices(initialCategoryId, initialCategoryName, false);
    
    // ========================================
    // ПЛАВНАЯ ПРОКРУТКА
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href && href !== '#' && href !== '#0' && href !== '#/') {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#' && targetId !== '#0') {
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        }
    });
    
    // ========================================
    // HEADER ПРИ СКРОЛЛЕ
    // ========================================
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        const currentScroll = window.pageYOffset;
        if (header) {
            if (currentScroll > lastScroll && currentScroll > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        }
        lastScroll = currentScroll;
    });
    
    // ========================================
    // FAQ ACCORDION (РАБОТАЕТ КАК НА LOCALHOST)
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item, .faq-item-enhanced');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question, .faq-question-enhanced');
        if (question) {
            question.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });
    
    // ========================================
    // МАСКА ТЕЛЕФОНА
    // ========================================
    const phoneInput = document.querySelector('input[type="tel"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d\+\-\s\(\)]/g, '');
        });
    }
    
    // ========================================
    // ФУНКЦИОНАЛ ДЕТАЛИ УСЛУГИ (ГАЛЕРЕЯ)
    // ========================================
    initProductDetail();
});

// ========================================
// ФУНКЦИИ ДЛЯ СТРАНИЦЫ УСЛУГИ (ГАЛЕРЕЯ)
// ========================================

function initProductDetail() {
    const mainImage = document.getElementById('mainImage');
    const mainVideoContainer = document.getElementById('mainVideo');
    const videoPlayer = document.getElementById('mainVideoPlayer');
    const thumbBtns = document.querySelectorAll('.thumb-btn');
    
    if (!mainImage || !mainVideoContainer || !videoPlayer || thumbBtns.length === 0) {
        return;
    }

    function switchMedia(type, src, poster = null) {
        if (type === 'image') {
            mainImage.src = src;
            mainImage.style.display = 'block';
            mainImage.style.opacity = '1';
            
            mainVideoContainer.style.display = 'none';
            if (videoPlayer) {
                videoPlayer.pause();
                videoPlayer.currentTime = 0;
                videoPlayer.removeAttribute('src'); 
                videoPlayer.load();
            }
            
        } else if (type === 'video') {
            mainImage.style.display = 'none';
            
            if (videoPlayer) {
                if (videoPlayer.src !== window.location.origin + src && videoPlayer.src !== src) {
                    videoPlayer.src = src;
                    videoPlayer.load();
                }
                
                if (poster) {
                    videoPlayer.poster = poster;
                } else {
                    videoPlayer.removeAttribute('poster');
                }
            }
            
            mainVideoContainer.style.display = 'block';
        }
    }
    
    function initMainMedia() {
        const activeThumb = document.querySelector('.thumb-btn.active');
        
        if (activeThumb) {
            const type = activeThumb.getAttribute('data-type');
            const src = activeThumb.getAttribute('data-src');
            const poster = activeThumb.getAttribute('data-poster');
            
            if (type && src) {
                switchMedia(type, src, poster);
            }
        } else if (thumbBtns.length > 0) {
            thumbBtns[0].click();
        }
    }
    
    thumbBtns.forEach((btn) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            thumbBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.getAttribute('data-type');
            const src = this.getAttribute('data-src');
            const poster = this.getAttribute('data-poster');
            
            if (type && src) {
                switchMedia(type, src, poster);
            }
        });
    });
    
    initMainMedia();
}

// ========================================
// ВИДЕО ПРЕВЬЮ
// ========================================

window.addEventListener('load', function() {
    const videoPlayer = document.getElementById('mainVideoPlayer');
    if (videoPlayer) {
        videoPlayer.addEventListener('error', function(e) {
            console.error('Ошибка загрузки видео:', e);
        });
        
        videoPlayer.addEventListener('loadedmetadata', function() {
            console.log('Видео готово к воспроизведению');
        });
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const videoThumbs = document.querySelectorAll('.thumb-btn[data-type="video"]');

    videoThumbs.forEach(btn => {
        const imgEl = btn.querySelector('img');
        const placeholderEl = btn.querySelector('.video-thumb-placeholder');
        const videoUrl = btn.getAttribute('data-src');

        if (placeholderEl && !imgEl) {
            const v = document.createElement('video');
            v.src = videoUrl;
            v.crossOrigin = "anonymous";
            v.muted = true;
            
            v.onloadeddata = function() {
                v.currentTime = 1;
            };

            v.onseeked = function() {
                const canvas = document.createElement('canvas');
                canvas.width = v.videoWidth || 320;
                canvas.height = v.videoHeight || 180;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
                
                const imgUrl = canvas.toDataURL('image/jpeg');
                
                placeholderEl.remove();
                
                const newImg = document.createElement('img');
                newImg.src = imgUrl;
                newImg.alt = "Превью видео";
                newImg.style.width = "100%";
                newImg.style.height = "100%";
                newImg.style.objectFit = "cover";
                
                btn.querySelector('.video-thumb').appendChild(newImg);
            };
            
            v.load();
        }
    });
});

// ========================================
// ОТСТУП ДЛЯ СЕКЦИИ ABOUT
// ========================================

function setAboutPadding() {
    const header = document.querySelector('header');
    const aboutSection = document.querySelector('.about-simple');
    if (header && aboutSection) {
        const headerHeight = header.offsetHeight;
        aboutSection.style.paddingTop = (headerHeight + 1) + 'px';
    }
}

window.addEventListener('load', setAboutPadding);
window.addEventListener('resize', setAboutPadding);