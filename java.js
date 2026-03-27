///Giỏ hàng//
let soLuong = 0;
let cart = {};
const cartKeyAliases = {
    dimaond: 'diamond',
    'diamond premium': 'diamond',
    'ruby deluxe': 'ruby',
    'silky sapphire': 'sapphire',
    emerald: 'emarile',
    emarald: 'emarile'
};

function normalizeCartData(rawCart) {
    const normalized = {};

    if (!rawCart || typeof rawCart !== 'object') {
        return normalized;
    }

    Object.entries(rawCart).forEach(([key, qty]) => {
        const mappedKey = normalizeProductKey(key);
        const safeQty = Number(qty && typeof qty === 'object' ? qty.quantity || qty.qty : qty) || 0;
        if (safeQty <= 0) {
            return;
        }
        normalized[mappedKey] = (normalized[mappedKey] || 0) + safeQty;
    });

    return normalized;
}

function normalizeProductKey(key) {
    if (!key) {
        return '';
    }
    const cleaned = String(key).trim().toLowerCase();
    return cartKeyAliases[cleaned] || cleaned;
}

function readCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('auroraCart');
        if (!savedCart) {
            return {};
        }
        return normalizeCartData(JSON.parse(savedCart));
    } catch (error) {
        localStorage.removeItem('auroraCart');
        return {};
    }
}

// Lưu giỏ hàng vào localStorage
function saveCart() {
    localStorage.setItem('auroraCart', JSON.stringify(cart));
}

// Cập nhật số hiển thị trên icon giỏ hàng
function updateCountDisplay() {
    const countEl = document.querySelector("#count");
    if (countEl) {
        soLuong = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        countEl.textContent = soLuong;
    }
}

// Load giỏ hàng từ localStorage
function loadCart() {
    cart = readCartFromStorage();
    saveCart();
    updateCountDisplay();
}

function refreshAddToCartButtons() {
    const buttons = document.querySelectorAll(".add-to-cart");
    buttons.forEach((btn) => {
        const productKey = normalizeProductKey(btn.dataset.name);
        if (!productKey) {
            return;
        }

        if (cart[productKey]) {
            btn.dataset.state = 'in-cart';
            btn.textContent = 'Xóa khỏi giỏ';
        } else {
            btn.dataset.state = 'not-in-cart';
            btn.textContent = 'Add';
        }
    });
}

document.addEventListener("click", function (event) {
  const btn = event.target.closest(".add-to-cart");
  if (!btn) {
    return;
  }

  let ten = normalizeProductKey(btn.dataset.name);
  if (!ten) {
    return;
  }

  if (cart[ten]) {
    delete cart[ten];
    showAddToCartPopup(ten, 'remove');
  } else {
    cart[ten] = 1;
    showAddToCartPopup(ten, 'add');
  }

  saveCart();
  updateCountDisplay();
  refreshAddToCartButtons();
  console.log(cart);
});

// POPUP THÊM GIỎ HÀNG NHỎ GỌN
function showAddToCartPopup(productName, action) {
    // Remove existing popup if any
    const existingPopup = document.querySelector('.add-cart-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'add-cart-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-icon">${action === 'remove' ? '−' : '✓'}</div>
            <div class="popup-text">
                <strong>${action === 'remove' ? 'Đã xóa khỏi giỏ!' : 'Đã thêm vào giỏ!'}</strong>
                <span>${getProductDisplayName(productName)}</span>
            </div>
            <div class="popup-actions">
                <button class="popup-btn-close" onclick="closePopup()">Tiếp tục</button>
                <button class="popup-btn-view" onclick="viewCart()">Xem giỏ</button>
            </div>
        </div>
    `;

    // Add styles
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;

    // Add CSS for popup content
    if (!document.querySelector('#popup-styles')) {
        const style = document.createElement('style');
        style.id = 'popup-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .add-cart-popup .popup-content {
                background: white;
                border-radius: 12px;
                padding: 25px;
                max-width: 320px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                animation: slideUp 0.3s ease;
            }
            
            .add-cart-popup .popup-icon {
                width: 50px;
                height: 50px;
                background: #28a745;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 15px;
                font-size: 24px;
                font-weight: bold;
            }
            
            .add-cart-popup .popup-text {
                margin-bottom: 20px;
            }
            
            .add-cart-popup .popup-text strong {
                display: block;
                color: #333;
                font-size: 16px;
                margin-bottom: 5px;
            }
            
            .add-cart-popup .popup-text span {
                color: #666;
                font-size: 14px;
            }
            
            .add-cart-popup .popup-actions {
                display: flex;
                gap: 10px;
            }
            
            .add-cart-popup .popup-btn-close,
            .add-cart-popup .popup-btn-view {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .add-cart-popup .popup-btn-close {
                background: #f8f9fa;
                color: #333;
            }
            
            .add-cart-popup .popup-btn-close:hover {
                background: #e9ecef;
            }
            
            .add-cart-popup .popup-btn-view {
                background: #d19f7b;
                color: white;
            }
            
            .add-cart-popup .popup-btn-view:hover {
                background: #b8936f;
            }
            
            /* Dark theme styles */
            body.dark-theme .add-cart-popup .popup-content {
                background: #2d3561;
                color: #eee;
            }
            
            body.dark-theme .add-cart-popup .popup-text strong {
                color: #eee;
            }
            
            body.dark-theme .add-cart-popup .popup-text span {
                color: #ccc;
            }
            
            body.dark-theme .add-cart-popup .popup-btn-close {
                background: #3d4561;
                color: #eee;
            }
            
            body.dark-theme .add-cart-popup .popup-btn-close:hover {
                background: #4d5571;
            }
        `;
        document.head.appendChild(style);
    }

    // Add to body
    document.body.appendChild(popup);

    // Auto close after 3 seconds
    setTimeout(() => {
        closePopup();
    }, 3000);
}

function closePopup() {
    const popup = document.querySelector('.add-cart-popup');
    if (popup) {
        popup.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => popup.remove(), 300);
    }
}

function viewCart() {
    closePopup();
    window.location.href = 'cart.html';
}

function getProductDisplayName(productName) {
    const displayNames = {
        'sapphire': 'Silky Sapphire',
        'ruby': 'Ruby Deluxe',
        'diamond': 'Diamond Premium',
        'emarile': 'Emerald',
        'bagels': 'Bagels',
        'dalida': 'Dalida',
        'fantasy': 'Fantasy',
        'keys': 'Keys'
    };
    return displayNames[productName] || productName;
}

// FLASH SALE COUNTDOWN - 24H TỰ ĐỘNG RESET
function startCountdown() {
    const countdownEl = document.getElementById('countdown');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!countdownEl || !hoursEl || !minutesEl || !secondsEl) {
        return;
    }

    const DURATION = 24 * 60 * 60 * 1000; // 24 giờ tính bằng ms
    const STORAGE_KEY = 'auroraFlashSaleEnd';

    // Lấy thời điểm kết thúc từ localStorage, nếu chưa có hoặc đã hết thì tạo mới
    function getEndTime() {
        const saved = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (saved) {
            const endTime = parseInt(saved);
            if (endTime > now) {
                return endTime; // Còn hạn, dùng tiếp
            }
        }

        // Hết hạn hoặc chưa có → reset 24h mới
        const newEnd = now + DURATION;
        localStorage.setItem(STORAGE_KEY, newEnd.toString());
        return newEnd;
    }

    let endTime = getEndTime();

    function updateCountdown() {
        const now = Date.now();
        let distance = endTime - now;

        // Hết giờ → tự động reset vô hạn sang chu kỳ 24h tiếp theo
        if (distance <= 0) {
            while (endTime <= now) {
                endTime += DURATION;
            }
            localStorage.setItem(STORAGE_KEY, endTime.toString());
            distance = endTime - now;

            // Khôi phục tiêu đề và nút mua sau reset
            const flashSaleTitle = document.querySelector('.flash-sale-header h2');
            if (flashSaleTitle) {
                flashSaleTitle.innerHTML = '⚡ FLASH SALE';
            }
            document.querySelectorAll('.flash-sale-products .add-to-cart').forEach(btn => {
                btn.disabled = false;
                btn.textContent = 'Add';
                btn.style.background = '';
            });
        }

        const hours   = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Ẩn ô "Ngày" vì chỉ đếm 24h
        const daysEl = document.getElementById('days');
        if (daysEl) {
            daysEl.closest('.countdown-item').style.display = 'none';
        }

        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');

        // Hiệu ứng nhấp nháy khi còn dưới 1 phút
        if (distance < 60000) {
            countdownEl.style.animation = 'pulse 1s infinite';
        } else {
            countdownEl.style.animation = '';
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Khởi động countdown khi trang load
startCountdown();

// DARK/LIGHT MODE TOGGLE
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    if (!themeToggle) {
        return;
    }
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('auroraTheme') || 'light';
    body.classList.toggle('dark-theme', savedTheme === 'dark');
    updateThemeIcon(savedTheme);
    
    // Toggle theme when button clicked
    themeToggle.addEventListener('click', function() {
        const isDark = body.classList.toggle('dark-theme');
        const currentTheme = isDark ? 'dark' : 'light';
        
        // Save to localStorage
        localStorage.setItem('auroraTheme', currentTheme);
        
        // Update icon with animation
        updateThemeIcon(currentTheme);
        
        // Add transition effect
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // Show notification
        showThemeNotification(currentTheme);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) {
        return;
    }
    themeIcon.style.transition = 'transform 0.3s ease';
    themeIcon.style.transform = 'rotate(360deg)';
    
    setTimeout(() => {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeIcon.style.transform = 'rotate(0deg)';
    }, 150);
}

function showThemeNotification(theme) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.innerHTML = `
        <span>${theme === 'dark' ? '🌙' : '☀️'} ${theme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}</span>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${theme === 'dark' ? '#2c3e50' : '#fff'};
        color: ${theme === 'dark' ? '#fff' : '#333'};
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    
    // Add animation keyframes if not exists
    if (!document.querySelector('#theme-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'theme-notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    initThemeToggle();
    refreshAddToCartButtons();
});

// slide //
const slides = document.querySelectorAll(".slide");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");

let index = 0;
if (slides.length && nextBtn && prevBtn) {
    nextBtn.addEventListener("click", function () {
      slides[index].classList.remove("active");

      index++;

      if (index >= slides.length) {
        index = 0;
      }

      slides[index].classList.add("active");
    });
    prevBtn.addEventListener("click", function () {
      slides[index].classList.remove("active");

      index--;

      if (index < 0) {
        index = slides.length - 1;
      }

      slides[index].classList.add("active");
    });
}
const section = document.querySelector('.new-arrivals-complex');
if (section) {
    const cols = section.querySelectorAll('.left-box, .right-text');
    const centerImg = section.querySelector('.center-image');

    cols.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.7s ease ${i * 0.2}s, 
                               transform 0.7s ease ${i * 0.2}s`;
    });

    if (centerImg) {
        centerImg.style.transform = 'translateY(30px)';
        centerImg.style.transition = 'transform 0.7s ease 0.1s';
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cols.forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });
                if (centerImg) {
                    centerImg.style.transform = 'translateY(0)';
                }
                observer.disconnect(); // Chỉ chạy 1 lần
            }
        });
    }, { threshold: 0.2 }); // 20% section hiện ra thì bắt đầu

    observer.observe(section);
}

const backToTop = document.querySelector("#backToTop");
window.addEventListener('scroll', function(){
  if (!backToTop) {
    return;
  }
  if (window.scrollY > 400){
    backToTop.style.display = "block";
  }else{
    backToTop.style.display = "none"
  }
});
if (backToTop) {
    backToTop.addEventListener("click", function() {
        window.scrollTo(0, 0);
    });
}