// Cart data
let cart = [];

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        // Show corresponding page
        const pageId = this.getAttribute('data-page');
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');

        // If cart page is opened, update it
        if (pageId === 'cart') {
            updateCartPage();
        }
    });
});

// Add-ons selection
document.querySelectorAll('.add-on').forEach(checkbox => {
    checkbox.addEventListener('click', function () {
        this.querySelector('.checkbox').classList.toggle('checked');
    });
});

// Quantity controls
document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
    btn.addEventListener('click', function () {
        const quantityElement = this.parentElement.querySelector('.quantity');
        let quantity = parseInt(quantityElement.textContent);
        quantityElement.textContent = quantity + 1;
    });
});

document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
    btn.addEventListener('click', function () {
        const quantityElement = this.parentElement.querySelector('.quantity');
        let quantity = parseInt(quantityElement.textContent);
        if (quantity > 1) {
            quantityElement.textContent = quantity - 1;
        }
    });
});

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function () {
        // Get item data
        const itemId = this.getAttribute('data-item');
        const itemName = this.getAttribute('data-name');
        const itemPrice = parseInt(this.getAttribute('data-price'));
        const itemImage = this.getAttribute('data-image');

        // Get quantity
        const quantity = parseInt(this.parentElement.querySelector('.quantity').textContent);

        // Get selected add-ons
        const addOns = [];
        this.parentElement.querySelectorAll('.checkbox.checked').forEach(checkbox => {
            const addonName = checkbox.parentElement.querySelector('.add-on-name').textContent;
            const addonComposition = checkbox.parentElement.querySelector('.addon-composition').textContent;
            const addonPrice = parseInt(checkbox.parentElement.querySelector('.add-on-price').textContent.replace('+', '').replace(' ₽', ''));
            addOns.push({
                name: addonName,
                composition: addonComposition,
                price: addonPrice
            });
        });

        // Calculate total price
        let totalPrice = itemPrice * quantity;
        addOns.forEach(addon => {
            totalPrice += addon.price * quantity;
        });

        // Add to cart
        cart.push({
            id: itemId + '-' + Date.now(), // Unique ID for each cart item
            itemId: itemId,
            name: itemName,
            basePrice: itemPrice,
            quantity: quantity,
            addOns: addOns,
            totalPrice: totalPrice,
            image: itemImage
        });

        // Update cart indicator
        updateCartIndicator();

        // Show confirmation
        showModal('cart-modal');
    });
});

// Update cart indicator
function updateCartIndicator() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-indicator').textContent = totalItems;
}

// Update cart page
function updateCartPage() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const totalAmount = document.getElementById('total-amount');

    // Clear cart items container
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartTotal.style.display = 'none';
        checkoutBtn.style.display = 'none';
    } else {
        emptyCartMessage.style.display = 'none';
        cartTotal.style.display = 'block';
        checkoutBtn.style.display = 'block';

        // Calculate total amount
        const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
        totalAmount.textContent = total;

        // Add each cart item
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            let addonsText = '';
            if (item.addOns.length > 0) {
                addonsText = item.addOns.map(addon => `${addon.name} (${addon.composition})`).join(', ');
            }

            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">                        ${item.name}</div>
                    ${addonsText ? `<div class="cart-item-addons">Допы: ${addonsText}</div>` : ''}
                    <div class="cart-item-price">${item.totalPrice} ₽</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}">+</button>
                    <button class="remove-item" data-index="${index}">×</button>
                </div>
            `;

            cartItemsContainer.appendChild(cartItem);
        });

        // Add event listeners for cart item controls
        document.querySelectorAll('.cart-item-controls .plus').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                cart[index].quantity += 1;
                cart[index].totalPrice = (cart[index].basePrice +
                    cart[index].addOns.reduce((sum, addon) => sum + addon.price, 0)) * cart[index].quantity;
                updateCartPage();
                updateCartIndicator();
            });
        });

        document.querySelectorAll('.cart-item-controls .minus').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                    cart[index].totalPrice = (cart[index].basePrice +
                        cart[index].addOns.reduce((sum, addon) => sum + addon.price, 0)) * cart[index].quantity;
                    updateCartPage();
                    updateCartIndicator();
                }
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCartPage();
                updateCartIndicator();
            });
        });
    }
}

// Modal functionality
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Modal event listeners
document.getElementById('modal-close').addEventListener('click', function () {
    hideModal('cart-modal');
});

document.getElementById('order-modal-close').addEventListener('click', function () {
    hideModal('order-modal');
});

document.getElementById('confirmation-modal-close').addEventListener('click', function () {
    hideModal('confirmation-modal');
    // Clear cart after successful order
    cart = [];
    updateCartIndicator();
    updateCartPage();
    // Return to menu
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[data-page="menu"]').classList.add('active');
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('menu').classList.add('active');
});

// Cart indicator click
document.getElementById('cart-indicator').addEventListener('click', function () {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[data-page="cart"]').classList.add('active');
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('cart').classList.add('active');
    updateCartPage();
});

// Checkout button
document.getElementById('checkout-btn').addEventListener('click', function () {
    if (cart.length > 0) {
        showModal('order-modal');
    }
});

// Order form submission
document.getElementById('order-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const comments = document.getElementById('order-comments').value;

    // Format order message
    let orderMessage = `НОВЫЙ ЗАКАЗ\n\n`;
    orderMessage += `Имя: ${name}\n`;
    orderMessage += `Телефон: ${phone}\n`;
    orderMessage += `Адрес: ${address}\n`;
    if (comments) {
        orderMessage += `Комментарий: ${comments}\n`;
    }
    orderMessage += `\nЗАКАЗ:\n`;

    cart.forEach((item, index) => {
        orderMessage += `${index + 1}. ${item.name} - ${item.quantity} шт. - ${item.totalPrice} ₽\n`;
        if (item.addOns.length > 0) {
            orderMessage += `   Допы: ${item.addOns.map(addon => addon.name).join(', ')}\n`;
        }
    });

    orderMessage += `\nИТОГО: ${cart.reduce((sum, item) => sum + item.totalPrice, 0)} ₽`;

    // Telegram bot integration (replace with actual bot token and chat ID)
    const botToken = 'YOUR_BOT_TOKEN';
    const chatId = 'YOUR_CHAT_ID';
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // In a real implementation, you would send this to your backend or directly to Telegram API
    console.log('Order details:', orderMessage);

    // For demo purposes, we'll just show the confirmation modal
    hideModal('order-modal');
    showModal('confirmation-modal');

    // In a real implementation, you would actually send the message:
    // fetch(telegramUrl, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         chat_id: chatId,
    //         text: orderMessage
    //     })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     hideModal('order-modal');
    //     showModal('confirmation-modal');
    // })
    // .catch(error => {
    //     console.error('Error sending order:', error);
    //     alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.');
    // });
});

// Initialize cart indicator
updateCartIndicator();