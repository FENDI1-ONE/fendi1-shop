const CART_KEY = "f1_cart_v1";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        console.error("Fehler beim Laden des Carts:", e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = getCart().reduce((sum, p) => sum + p.qty, 0);
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) cartCountEl.textContent = count > 99 ? "99+" : count;
}

// Fügt Produkt zum Cart hinzu
function addToCart(product) {
    const cart = getCart();
    const idx = cart.findIndex(p => p.sku === product.sku && p.option === product.option);
    if (idx > -1) {
        cart[idx].qty += product.qty;
    } else {
        cart.push(product);
    }
    saveCart(cart);
}

// Initialisierung
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    const addBtn = document.querySelector(".add-to-cart-btn");
    const packSelect = document.getElementById("quantity");

    if (addBtn && packSelect) {
        addBtn.addEventListener("click", () => {
            const selectedOption = packSelect.options[packSelect.selectedIndex];
            const qty = 1;
            const price = parseFloat(selectedOption.dataset.price);

            const product = {
                sku: addBtn.dataset.sku,
                name: addBtn.dataset.name,
                price: price,
                option: selectedOption.text,
                qty: qty,
                img: document.querySelector(".product-image img")?.src || ""
            };

            addToCart(product);

            // Button Feedback
            addBtn.textContent = "✔ Hinzugefügt!";
            setTimeout(() => (addBtn.textContent = "In den Warenkorb"), 1200);
        });
    }

    // PayPal Button
    const paypalContainer = document.getElementById("paypal-button-container");
    if (paypalContainer && packSelect) {
        paypal.Buttons({
            createOrder: (data, actions) => {
                const selectedOption = packSelect.options[packSelect.selectedIndex];
                const price = parseFloat(selectedOption.dataset.price);
                return actions.order.create({
                    purchase_units: [{ amount: { value: price.toFixed(2) } }]
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then(details => {
                    alert('Danke für deinen Kauf, ' + details.payer.name.given_name + '!');
                });
            },
            onError: (err) => {
                console.error("PayPal Error:", err);
                alert("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
            }
        }).render('#paypal-button-container');
    }
});