// Data sản phẩm (giả lập database)
const products = {
    'sapphire': { name: 'Silky Sapphire', price: 12000000, image: 'anh.jpg/z7625724983856_c1d68f84c4808cade44e71ae604fcedf.jpg' },
    'ruby': { name: 'Ruby', price: 990000, image: 'anh.jpg/z7625724984668_689310eae47e67df0eb2935dd06f92e8.jpg' },
    'diamond': { name: 'Diamond', price: 10000000, image: 'anh.jpg/z7625724997735_6959a26e8844298654e2539fbd277ad7.jpg' },
    'emarile': { name: 'Emerald', price: 199000, image: 'anh.jpg/z7625725028527_516fd362aef5083815de7626b71cca7b.jpg' },
    'bagels': { name: 'Bagels', price: 199000, image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    'dalida': { name: 'Dalida', price: 199000, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    'fantasy': { name: 'Fantasy', price: 249000, image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
    'keys': { name: 'Keys', price: 299000, image: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
};
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
        if (safeQty <= 0 || !products[mappedKey]) {
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

function safeParseJSON(value, fallback) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

// Load giỏ hàng từ localStorage
function loadCart() {
    const savedCart = localStorage.getItem('auroraCart');
    const rawCart = savedCart ? safeParseJSON(savedCart, {}) : {};
    const normalizedCart = normalizeCartData(rawCart);
    localStorage.setItem('auroraCart', JSON.stringify(normalizedCart));
    return normalizedCart;
}

// Lưu giỏ hàng vào localStorage
function saveCart(cart) {
    localStorage.setItem('auroraCart', JSON.stringify(cart));
    updateCartCount();
}

// Cập nhật số lượng giỏ hàng trên header
function updateCartCount() {
    const cart = loadCart();
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const countElement = document.getElementById('count');
    if (countElement) {
        countElement.textContent = totalItems;
    }
}

// Data mã giảm giá (giả lập)
const discountCodes = {
    'SALE10': { discount: 10, description: 'Giảm 10%' },
    'SALE20': { discount: 20, description: 'Giảm 20%' },
    'WELCOME': { discount: 15, description: 'Giảm 15% cho khách mới' },
    'FLASH30': { discount: 30, description: 'Flash Sale giảm 30%' }
};

// Hiển thị giỏ hàng
function displayCart() {
    const cart = loadCart();
    const cartContent = document.getElementById('cart-content');
    
    if (Object.keys(cart).length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <h2>🛒 Giỏ hàng trống</h2>
                <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                <a href="trangchu.html" class="btn btn-primary">Tiếp tục mua sắm</a>
            </div>
        `;
        return;
    }
    
    let cartHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Tổng</th>
                    <th>Xóa</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let subtotal = 0;
    
    let validItemCount = 0;
    for (const [productId, quantity] of Object.entries(cart)) {
        const product = products[productId];
        if (!product) continue;
        validItemCount++;
        
        const itemTotal = product.price * quantity;
        subtotal += itemTotal;
        
        cartHTML += `
            <tr class="cart-item">
                <td>
                    <img src="${product.image}" alt="${product.name}">
                    <div style="display: inline-block; margin-left: 15px;">
                        <strong>${product.name}</strong>
                    </div>
                </td>
                <td>${product.price.toLocaleString()} VND</td>
                <td>
                    <div class="quantity-controls">
                        <button class="quantity-btn" type="button" data-action="decrease" data-product-id="${productId}" onclick="updateQuantity('${productId}', -1)">-</button>
                        <span>${quantity}</span>
                        <button class="quantity-btn" type="button" data-action="increase" data-product-id="${productId}" onclick="updateQuantity('${productId}', 1)">+</button>
                    </div>
                </td>
                <td><strong>${itemTotal.toLocaleString()} VND</strong></td>
                <td>
                    <button class="remove-btn" type="button" data-action="remove" data-product-id="${productId}" onclick="removeItem('${productId}')">Xóa</button>
                </td>
            </tr>
        `;
    }

    if (validItemCount === 0) {
        saveCart({});
        cartContent.innerHTML = `
            <div class="empty-cart">
                <h2>🛒 Giỏ hàng trống</h2>
                <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                <a href="trangchu.html" class="btn btn-primary">Tiếp tục mua sắm</a>
            </div>
        `;
        return;
    }
    
    cartHTML += `
            </tbody>
        </table>
        
        <div class="discount-section">
            <h3>Mã giảm giá</h3>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="discount-code" placeholder="Nhập mã giảm giá" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                <button class="btn btn-secondary" onclick="applyDiscount()">Áp dụng</button>
            </div>
            <div id="discount-message"></div>
        </div>
        
        <div class="cart-summary">
            <div style="margin-bottom: 10px;">
                <span>Tạm tính: </span>
                <span id="subtotal">${subtotal.toLocaleString()} VND</span>
            </div>
            <div id="discount-row" style="margin-bottom: 10px; color: #28a745; display: none;">
                <span>Giảm giá: </span>
                <span id="discount-amount">0 VND</span>
            </div>
            <div class="cart-total">
                Tổng cộng: <span id="total-amount">${subtotal.toLocaleString()}</span> VND
            </div>
        </div>
        
        <div class="cart-actions">
            <a href="trangchu.html" class="btn btn-secondary">← Tiếp tục mua sắm</a>
            <button class="btn btn-primary" onclick="showCheckoutForm()">Thanh toán</button>
        </div>
    `;
    
    cartContent.innerHTML = cartHTML;
}

// Áp dụng mã giảm giá
function applyDiscount() {
    const codeInput = document.getElementById('discount-code');
    const messageDiv = document.getElementById('discount-message');
    const discountRow = document.getElementById('discount-row');
    const discountAmountSpan = document.getElementById('discount-amount');
    const totalAmountSpan = document.getElementById('total-amount');
    const subtotalSpan = document.getElementById('subtotal');
    
    const code = codeInput.value.toUpperCase().trim();
    
    if (!code) {
        messageDiv.innerHTML = '<span style="color: #dc3545;">Vui lòng nhập mã giảm giá</span>';
        return;
    }
    
    if (!discountCodes[code]) {
        messageDiv.innerHTML = '<span style="color: #dc3545;">Mã giảm giá không hợp lệ</span>';
        return;
    }
    
    const discount = discountCodes[code];
    const cart = loadCart();
    
    // Tính tạm tính
    let subtotal = 0;
    for (const [productId, quantity] of Object.entries(cart)) {
        const product = products[productId];
        if (product) {
            subtotal += product.price * quantity;
        }
    }
    
    // Tính giảm giá và tổng cộng
    const discountAmount = subtotal * (discount.discount / 100);
    const total = subtotal - discountAmount;
    
    // Hiển thị kết quả
    messageDiv.innerHTML = `<span style="color: #28a745;">✓ ${discount.description} đã áp dụng</span>`;
    discountRow.style.display = 'block';
    discountAmountSpan.textContent = `-${discountAmount.toLocaleString()} VND`;
    totalAmountSpan.textContent = total.toLocaleString();
    
    // Lưu mã giảm giá vào localStorage
    localStorage.setItem('appliedDiscount', JSON.stringify({
        code: code,
        discount: discount.discount,
        amount: discountAmount
    }));
}

// Cập nhật số lượng sản phẩm
function updateQuantity(productId, change) {
    const cart = loadCart();
    
    if (cart[productId]) {
        cart[productId] += change;
        
        if (cart[productId] <= 0) {
            delete cart[productId];
        }
        
        saveCart(cart);
        displayCart();
        
        // Áp dụng lại mã giảm giá nếu có
        const savedDiscount = localStorage.getItem('appliedDiscount');
        if (savedDiscount) {
            const discount = JSON.parse(savedDiscount);
            document.getElementById('discount-code').value = discount.code;
            applyDiscount();
        }
    }
}

function setupCartActions() {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) {
        return;
    }

    cartContent.addEventListener('click', function (event) {
        const targetBtn = event.target.closest('button[data-action][data-product-id]');
        if (!targetBtn) {
            return;
        }

        const productId = targetBtn.dataset.productId;
        const action = targetBtn.dataset.action;

        if (!productId || !action) {
            return;
        }

        if (action === 'remove') {
            removeItem(productId);
            return;
        }

        if (action === 'increase') {
            updateQuantity(productId, 1);
            return;
        }

        if (action === 'decrease') {
            updateQuantity(productId, -1);
            return;
        }
    });
}

// Xóa sản phẩm
function removeItem(productId) {
    const cart = loadCart();
    const normalizedId = normalizeProductKey(productId);
    delete cart[normalizedId];
    delete cart[productId];
    saveCart(cart);
    displayCart();
    
    // Áp dụng lại mã giảm giá nếu có
    const savedDiscount = localStorage.getItem('appliedDiscount');
    if (savedDiscount) {
        const discountEl = document.getElementById('discount-code');
        if (discountEl) {
            const discount = safeParseJSON(savedDiscount, null);
            if (!discount) {
                return;
            }
            discountEl.value = discount.code;
            applyDiscount();
        }
    }
}

// Hiển thị form đặt hàng
function showCheckoutForm() {
    const cart = loadCart();
    
    if (Object.keys(cart).length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }
    
    const cartContent = document.getElementById('cart-content');
    
    let subtotal = 0;
    for (const [productId, quantity] of Object.entries(cart)) {
        const product = products[productId];
        if (product) {
            subtotal += product.price * quantity;
        }
    }
    
    // Lấy thông tin giảm giá
    let discountAmount = 0;
    let total = subtotal;
    const savedDiscount = localStorage.getItem('appliedDiscount');
    if (savedDiscount) {
        const discount = JSON.parse(savedDiscount);
        discountAmount = discount.amount;
        total = subtotal - discountAmount;
    }
    
    cartContent.innerHTML = `
        <div class="checkout-form">
            <h2>Thông tin đặt hàng</h2>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="fullname">Họ và tên *</label>
                    <input type="text" id="fullname" required>
                    <span class="error-message" id="fullname-error"></span>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="phone">Số điện thoại *</label>
                    <input type="tel" id="phone" required>
                    <span class="error-message" id="phone-error"></span>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="address">Địa chỉ giao hàng *</label>
                    <input type="text" id="address" required>
                    <span class="error-message" id="address-error"></span>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email">
                    <span class="error-message" id="email-error"></span>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="note">Ghi chú</label>
                    <textarea id="note" rows="3"></textarea>
                </div>
            </div>
            
            <div class="order-summary">
                <h3>Tóm tắt đơn hàng</h3>
                <div class="summary-row">
                    <span>Tạm tính:</span>
                    <span>${subtotal.toLocaleString()} VND</span>
                </div>
                ${discountAmount > 0 ? `
                <div class="summary-row discount">
                    <span>Giảm giá:</span>
                    <span>-${discountAmount.toLocaleString()} VND</span>
                </div>
                ` : ''}
                <div class="summary-row total">
                    <span>Tổng cộng:</span>
                    <span>${total.toLocaleString()} VND</span>
                </div>
            </div>
            
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="displayCart()">← Quay lại giỏ hàng</button>
                <button class="btn btn-primary" onclick="submitOrder()">Xác nhận đặt hàng</button>
            </div>
        </div>
    `;
    
    // Thêm CSS cho form
    const style = document.createElement('style');
    style.textContent = `
        .checkout-form {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .form-row {
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }
        
        .error-message {
            color: #dc3545;
            font-size: 14px;
            margin-top: 5px;
            display: block;
        }
        
        .order-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .summary-row.discount {
            color: #28a745;
        }
        
        .summary-row.total {
            font-weight: bold;
            font-size: 18px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        .form-actions {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            text-decoration: none;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
}

// Validate và submit đơn hàng
function submitOrder() {
    // Lấy dữ liệu form
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const note = document.getElementById('note').value.trim();
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    let hasError = false;
    
    // Validate họ tên
    if (!fullname) {
        document.getElementById('fullname-error').textContent = 'Vui lòng nhập họ tên';
        hasError = true;
    } else if (fullname.length < 2) {
        document.getElementById('fullname-error').textContent = 'Họ tên quá ngắn';
        hasError = true;
    }
    
    // Validate số điện thoại
    const phoneRegex = /(0[3-9][0-9]{8})$/;
    if (!phone) {
        document.getElementById('phone-error').textContent = 'Vui lòng nhập số điện thoại';
        hasError = true;
    } else if (!phoneRegex.test(phone)) {
        document.getElementById('phone-error').textContent = 'Số điện thoại không hợp lệ (ví dụ: 0912345678)';
        hasError = true;
    }
    
    // Validate địa chỉ
    if (!address) {
        document.getElementById('address-error').textContent = 'Vui lòng nhập địa chỉ';
        hasError = true;
    } else if (address.length < 10) {
        document.getElementById('address-error').textContent = 'Địa chỉ quá ngắn';
        hasError = true;
    }
    
    // Validate email (nếu có)
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('email-error').textContent = 'Email không hợp lệ';
            hasError = true;
        }
    }
    
    if (hasError) {
        return;
    }
    
    // Tính tổng tiền
    const cart = loadCart();
    let subtotal = 0;
    for (const [productId, quantity] of Object.entries(cart)) {
        const product = products[productId];
        if (product) {
            subtotal += product.price * quantity;
        }
    }
    
    let total = subtotal;
    const savedDiscount = localStorage.getItem('appliedDiscount');
    if (savedDiscount) {
        const discount = JSON.parse(savedDiscount);
        total = subtotal - discount.amount;
    }
    
    // Hiển thị xác nhận đơn hàng
    const orderInfo = {
        fullname,
        phone,
        address,
        email,
        note,
        items: cart,
        subtotal,
        total,
        discount: savedDiscount ? JSON.parse(savedDiscount) : null,
        orderDate: new Date().toISOString()
    };
    
    console.log('Đơn hàng:', orderInfo);
    
    if (confirm(`Xác nhận đặt hàng với tổng số tiền ${total.toLocaleString()} VND?`)) {
        // Xóa giỏ hàng và mã giảm giá
        localStorage.removeItem('auroraCart');
        localStorage.removeItem('appliedDiscount');
        updateCartCount();
        
        alert('🎉 Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
        
        // Chuyển về trang chủ
        window.location.href = 'trangchu.html';
    }
}

// Load trang
document.addEventListener('DOMContentLoaded', function() {
    setupCartActions();
    updateCartCount();
    displayCart();
});