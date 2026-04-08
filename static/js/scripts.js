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
    // FAQ ACCORDION (ИСПРАВЛЕННАЯ ВЕРСИЯ)
    // ========================================
    function initFaq() {
        // Ищем все элементы FAQ
        const faqItems = document.querySelectorAll('.faq-item-enhanced');
        
        faqItems.forEach(function(item) {
            // Находим вопрос и ответ
            const question = item.querySelector('.faq-question-enhanced');
            const answer = item.querySelector('.faq-answer-enhanced');
            const icon = question ? question.querySelector('.fa-chevron-down') : null;
            
            if (!question || !answer) return;
            
            // Скрываем все ответы изначально
            answer.style.display = 'none';
            
            // Убираем старый обработчик, если есть
            question.removeEventListener('click', window['faqHandler_' + item.id]);
            
            // Создаем новый обработчик
            const handler = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Проверяем текущее состояние
                const isOpen = answer.style.display === 'block';
                
                // Закрываем все другие вопросы
                faqItems.forEach(function(otherItem) {
                    const otherAnswer = otherItem.querySelector('.faq-answer-enhanced');
                    const otherIcon = otherItem.querySelector('.faq-question-enhanced .fa-chevron-down');
                    if (otherAnswer && otherItem !== item) {
                        otherAnswer.style.display = 'none';
                        otherItem.classList.remove('active');
                        if (otherIcon) {
                            otherIcon.style.transform = 'rotate(0deg)';
                        }
                    }
                });
                
                // Переключаем текущий вопрос
                if (!isOpen) {
                    answer.style.display = 'block';
                    item.classList.add('active');
                    if (icon) {
                        icon.style.transform = 'rotate(180deg)';
                    }
                } else {
                    answer.style.display = 'none';
                    item.classList.remove('active');
                    if (icon) {
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            };
            
            // Сохраняем обработчик
            window['faqHandler_' + Date.now() + '_' + Math.random()] = handler;
            question.addEventListener('click', handler);
            
            // Добавляем стиль курсора
            question.style.cursor = 'pointer';
        });
    }
    
    // Инициализируем FAQ
    initFaq();
    
    // Наблюдатель за изменениями для динамически добавляемых FAQ
    const faqObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                if (document.querySelector('.faq-item-enhanced')) {
                    initFaq();
                }
            }
        });
    });
    
    faqObserver.observe(document.body, {
        childList: true,
        subtree: true
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
    // ФУНКЦИОНАЛ ДЕТАЛИ УСЛУГИ
    // ========================================
    initProductDetail();
});

// ========================================
// ФУНКЦИИ ДЛЯ СТРАНИЦЫ УСЛУГИ (ИСПРАВЛЕННАЯ)
// ========================================

function initProductDetail() {
    // Ждем полной загрузки DOM
    setTimeout(function() {
        const mainImage = document.getElementById('mainImage');
        const mainVideoContainer = document.getElementById('mainVideo');
        const videoPlayer = document.getElementById('mainVideoPlayer');
        const thumbBtns = document.querySelectorAll('.thumb-btn');
        
        if (!thumbBtns.length) {
            console.log('Нет миниатюр для инициализации');
            return;
        }
        
        console.log('Инициализация product detail, найдено миниатюр:', thumbBtns.length);
        
        // Создаем контейнеры если их нет
        let imageElement = mainImage;
        let videoContainerElement = mainVideoContainer;
        let videoElement = videoPlayer;
        
        // Функция для получения правильного URL
        function getFullUrl(url) {
            if (!url) return url;
            // Если URL уже абсолютный или начинается с http
            if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
                return url;
            }
            // Если URL начинается с /, возвращаем как есть
            if (url.startsWith('/')) {
                return url;
            }
            // Иначе добавляем /
            return '/' + url;
        }
        
        function switchMedia(type, src, poster) {
            console.log('Switch media:', type, src);
            
            if (type === 'image') {
                if (imageElement) {
                    const fullSrc = getFullUrl(src);
                    imageElement.src = fullSrc;
                    imageElement.style.display = 'block';
                }
                
                if (videoContainerElement) {
                    videoContainerElement.style.display = 'none';
                }
                
                if (videoElement) {
                    videoElement.pause();
                }
                
            } else if (type === 'video') {
                if (imageElement) {
                    imageElement.style.display = 'none';
                }
                
                if (videoElement && videoContainerElement) {
                    const fullSrc = getFullUrl(src);
                    
                    if (videoElement.src !== fullSrc) {
                        videoElement.src = fullSrc;
                        videoElement.load();
                    }
                    
                    if (poster) {
                        videoElement.poster = getFullUrl(poster);
                    }
                    
                    videoContainerElement.style.display = 'block';
                }
            }
        }
        
        function initMainMedia() {
            // Находим активную миниатюру
            let activeThumb = document.querySelector('.thumb-btn.active');
            
            // Если нет активной, активируем первую
            if (!activeThumb && thumbBtns.length > 0) {
                activeThumb = thumbBtns[0];
                activeThumb.classList.add('active');
            }
            
            if (activeThumb) {
                const type = activeThumb.getAttribute('data-type');
                const src = activeThumb.getAttribute('data-src');
                const poster = activeThumb.getAttribute('data-poster');
                
                if (type && src) {
                    switchMedia(type, src, poster);
                }
            }
        }
        
        // Добавляем обработчики на миниатюры
        thumbBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Убираем активный класс у всех
                thumbBtns.forEach(function(b) {
                    b.classList.remove('active');
                });
                
                // Добавляем активный класс текущей
                this.classList.add('active');
                
                const type = this.getAttribute('data-type');
                const src = this.getAttribute('data-src');
                const poster = this.getAttribute('data-poster');
                
                if (type && src) {
                    switchMedia(type, src, poster);
                }
            });
        });
        
        // Инициализируем
        initMainMedia();
        
        // Обработка ошибок видео
        if (videoElement) {
            videoElement.addEventListener('error', function(e) {
                console.error('Ошибка загрузки видео:', e);
            });
        }
        
    }, 100); // Небольшая задержка для гарантии загрузки DOM
}

// ========================================
// ВИДЕО ПРЕВЬЮ (ИСПРАВЛЕННАЯ)
// ========================================

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        const videoThumbs = document.querySelectorAll('.thumb-btn[data-type="video"]');
        
        videoThumbs.forEach(function(btn) {
            // Проверяем, есть ли уже превью
            const existingImg = btn.querySelector('img:not(.play-badge)');
            if (existingImg && existingImg.src && !existingImg.src.includes('placeholder')) {
                return;
            }
            
            const placeholderEl = btn.querySelector('.video-thumb-placeholder');
            const videoUrl = btn.getAttribute('data-src');
            
            if (placeholderEl && videoUrl) {
                // Получаем абсолютный URL
                let absoluteVideoUrl = videoUrl;
                if (absoluteVideoUrl && !absoluteVideoUrl.startsWith('http') && !absoluteVideoUrl.startsWith('https') && !absoluteVideoUrl.startsWith('//')) {
                    if (!absoluteVideoUrl.startsWith('/')) {
                        absoluteVideoUrl = '/' + absoluteVideoUrl;
                    }
                }
                
                const v = document.createElement('video');
                v.src = absoluteVideoUrl;
                v.crossOrigin = "anonymous";
                v.muted = true;
                v.preload = 'metadata';
                
                v.onloadeddata = function() {
                    v.currentTime = 1;
                };
                
                v.onseeked = function() {
                    try {
                        if (v.videoWidth && v.videoHeight) {
                            const canvas = document.createElement('canvas');
                            canvas.width = v.videoWidth;
                            canvas.height = v.videoHeight;
                            const ctx = canvas.getContext('2d');
                            
                            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
                            
                            const imgUrl = canvas.toDataURL('image/jpeg');
                            
                            if (placeholderEl && placeholderEl.parentNode) {
                                // Создаем новое изображение
                                const newImg = document.createElement('img');
                                newImg.src = imgUrl;
                                newImg.alt = "Превью видео";
                                newImg.style.width = "100%";
                                newImg.style.height = "100%";
                                newImg.style.objectFit = "cover";
                                
                                // Заменяем плейсхолдер
                                const videoThumbDiv = btn.querySelector('.video-thumb');
                                if (videoThumbDiv) {
                                    // Удаляем плейсхолдер
                                    const oldPlaceholder = videoThumbDiv.querySelector('.video-thumb-placeholder');
                                    if (oldPlaceholder) {
                                        oldPlaceholder.remove();
                                    }
                                    // Вставляем изображение перед play-badge
                                    const playBadge = videoThumbDiv.querySelector('.play-badge');
                                    if (playBadge) {
                                        videoThumbDiv.insertBefore(newImg, playBadge);
                                    } else {
                                        videoThumbDiv.appendChild(newImg);
                                    }
                                }
                            }
                        }
                    } catch(e) {
                        console.error('Ошибка создания превью:', e);
                    }
                };
                
                v.onerror = function() {
                    console.error('Ошибка загрузки видео для превью:', absoluteVideoUrl);
                    if (placeholderEl) {
                        placeholderEl.innerHTML = '<i class="fas fa-video"></i><span>Видео</span>';
                    }
                };
                
                v.load();
            }
        });
    }, 100);
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