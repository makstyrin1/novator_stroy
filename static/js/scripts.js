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

function showToast(message, isError = false) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    if (isError) toast.classList.add('error');
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

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
    setTimeout(() => toast.style.opacity = '0', 4000);
    setTimeout(() => toast.remove(), 4300);
}

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

window.copyEmail = function(event) {
    if (event) event.preventDefault();
    const email = "kosty161288@icloud.com";
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => showToast('✓ Email скопирован!')).catch(() => fallbackCopy(email));
    } else {
        fallbackCopy(email);
    }
    return false;
};

// ========================================
// ФИЛЬТРАЦИЯ УСЛУГ
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const servicesGrid = document.getElementById('servicesGrid');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    
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
            </div>`;
        });
        
        servicesGrid.innerHTML = html;
        if (typeof AOS !== 'undefined') AOS.refresh();
    }
    
    function filterServices(categoryId, categoryName, updateUrl = true) {
        let filteredServices = categoryId === 'all' ? allServices : allServices.filter(service => service.category_id == categoryId);
        renderServices(filteredServices);
        
        if (sectionTitle && sectionSubtitle) {
            if (categoryId === 'all') {
                sectionTitle.textContent = 'Наши услуги';
                sectionSubtitle.textContent = 'Профессиональные решения для любых задач';
            } else {
                sectionTitle.textContent = categoryName;
                sectionSubtitle.textContent = categoryName.toLowerCase() + ' от профессионалов';
            }
        }
        
        if (updateUrl) {
            if (categoryId === 'all') {
                window.history.pushState({ category: 'all' }, '', '/services/');
            } else {
                window.history.pushState({ category: categoryId }, '', `/services/category/${categoryId}/`);
            }
        }
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const categoryId = this.getAttribute('data-category-id');
            const categoryName = this.getAttribute('data-category-name');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterServices(categoryId, categoryName, true);
        });
    });
    
    window.addEventListener('popstate', function() {
        const currentPath = window.location.pathname;
        let activeCategoryId = 'all';
        let activeCategoryName = 'all';
        
        if (currentPath.includes('/services/category/')) {
            const match = currentPath.match(/\/category\/(\d+)/);
            if (match) {
                activeCategoryId = match[1];
                const activeBtn = document.querySelector(`.filter-btn[data-category-id="${activeCategoryId}"]`);
                if (activeBtn) activeCategoryName = activeBtn.getAttribute('data-category-name');
                filterButtons.forEach(btn => {
                    if (btn.getAttribute('data-category-id') === activeCategoryId) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        } else {
            filterButtons.forEach(btn => {
                if (btn.getAttribute('data-category-id') === 'all') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        filterServices(activeCategoryId, activeCategoryName, false);
    });
    
    const currentPath = window.location.pathname;
    let initialCategoryId = 'all';
    let initialCategoryName = 'all';
    
    if (currentPath.includes('/services/category/')) {
        const match = currentPath.match(/\/category\/(\d+)/);
        if (match) {
            initialCategoryId = match[1];
            const activeBtn = document.querySelector(`.filter-btn[data-category-id="${initialCategoryId}"]`);
            if (activeBtn) initialCategoryName = activeBtn.getAttribute('data-category-name');
            filterButtons.forEach(btn => {
                if (btn.getAttribute('data-category-id') === initialCategoryId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }
    
    filterServices(initialCategoryId, initialCategoryName, false);
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href && href !== '#' && href !== '#0' && href !== '#/') {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#' && targetId !== '#0') {
                    const target = document.querySelector(targetId);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    });
    
    // Header при скролле
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
    
    // Маска телефона
    const phoneInput = document.querySelector('input[type="tel"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d\+\-\s\(\)]/g, '');
        });
    }
});

// Отступ для секции about
function setAboutPadding() {
    const header = document.querySelector('header');
    const aboutSection = document.querySelector('.about-simple');
    if (header && aboutSection) {
        aboutSection.style.paddingTop = (header.offsetHeight + 1) + 'px';
    }
}

window.addEventListener('load', setAboutPadding);
window.addEventListener('resize', setAboutPadding);