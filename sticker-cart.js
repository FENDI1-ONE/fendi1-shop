const CART_KEY = "f1_cart_v1";
const stickerName = "FENDI1 Sticker Pack #1";
const selectedPack = document.querySelector("#quantity");
const stickerPrice = document.querySelector("#price-display");

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
            addBtn.textContent = "✔ added succesfully!";
            setTimeout(() => (addBtn.textContent = "Add to cart"), 1200);
        });
    }

    // PayPal Button
    const paypalContainer = document.getElementById("paypal-button-container");
    if (paypalContainer && packSelect) {
        paypal.Buttons({
            createOrder: (_data, actions) => {
                const selectedOption = packSelect.options[packSelect.selectedIndex];
                const price = parseFloat(selectedOption.dataset.price);
                const quantity = 1;
                const productName = "FENDI1 Sticker Pack #1";
                const total = (price * quantity).toFixed(2);
                return actions.order.create({
                    purchase_units: [{
                    amount: { currency_code: "EUR",
                         value: total,
                         breakdown: {
                            item_total: {
                                currency_code: "EUR",
                                value: total
                            }
                         }
                    },
                    description: productName,
                    items: [{
                        name: productName,
                        unit_amount: {
                            currency_code: "EUR",
                            value: price.toFixed(2)
                        },
                        quantity: quantity.toString()
                    }
                ]
            }]

                });
            },
            onApprove: async (data, actions) => {
                const selectedOption = packSelect.options[packSelect.selectedIndex];
                const packText = selectedOption.textContent;
                const packLabel = packText.split("-")[0];
                const details = await actions.order.capture();
                const price = parseFloat(selectedOption.dataset.price);

                console.log("PayPal-Details:", details);
                const payerEmail = details.payer.email_adress;
                const payerName = details.payer.name.given_name;
                const orderId = details.id;
                const totalAmount = details.purchase_units[0].amount.value;
                const StickerData = {
                    name: stickerName,
                    price: price,
                    size: packLabel
                };
            try {
            const res = await fetch("http://localhost:3000/send-confirmation", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                payerName,
                payerEmail,
                items: [StickerData],
                totalAmount,
                rawPayPalOrder: details
            })
            });
            const dataRes = await res.json();
            console.log("serverantwort:", dataRes);
                alert('Thank you for your support, ' + details.payer.name.given_name + '!');
        }   catch(err) {
            console.error("Fehler bei der Bestellung:", err);
            alert("We are very sorry to inform you that there was an issue with your order. Please try again.");
        }
            
            }
        }).render('#paypal-button-container');
    }  else {
        console.log("PayPal SDK wurde nicht geladen");
    }
})