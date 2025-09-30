const CART_KEY = "f1_cart_v1";

const images = {
    white: [
        "assets/love&drugsFront&Back.png",
        "assets/love&drugsFrontLayDown.png",
        "assets/love&drugsBackLayDown.png",
        "assets/love&drugsLeftDetail.png",
        "assets/love&drugsRightDetail.png"
    ]
};

const mainImage = document.getElementById("main-shirt");
const thumbnailContainer = document.getElementById("thumbnail-container");
const colorBoxes = document.querySelectorAll(".color-box");
const sizeSelect = document.getElementById("shirt1-size");

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch(e) {
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

function updateProductData() {
    const sku = `shirt-${selectedColor}-${selectedSize}`;
    const price = 29.99;
    paypalContainer.dataset.sku = sku;
    paypalContainer.dataset.price = price;
    paypalContainer.dataset.name = `FENDI1 Shirt-${selectedColor} ${selectedSize}`;
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

let selectedColor = "white";
let selectedSize = "s";


function loadThumbnails(color) {
    const list = images[color];
    if (!list || !list.length) return;
    mainImage.src = list[0];
    thumbnailContainer.innerHTML = "";
    list.forEach((src, idx) => {
        const thumb = document.createElement("img");
        thumb.src = src;
        thumb.className = "thumbnail";
        if (idx === 0) thumb.classList.add("active-thumb");
        thumb.addEventListener("click", () => {
            mainImage.src = src;
            thumbnailContainer.querySelectorAll("img").forEach(t => t.classList.remove("active-thumb"));
            thumb.classList.add("active-thumb");
        });
        thumbnailContainer.appendChild(thumb);
    });
}

sizeSelect.addEventListener("change", () => {
    selectedSize = sizeSelect.value;
    updateProductData();
})

const defaultColor = "white";
loadThumbnails(defaultColor);


const addBtn = document.querySelector(".add-to-cart-btn");

if (addBtn && sizeSelect) {
    addBtn.addEventListener("click", () => {
        const price = 29.99;
        const sku = `shirt-${selectedColor}-${selectedSize}`;
        const name = `FENDI1 SHIRT (${selectedColor}, ${selectedSize})`;
        const qty = 1;
        let img = images.white[0];

        const product = {
            sku, 
            name,
            price,
            color: selectedColor,
            size: selectedSize,
            qty: qty,
            img: img
        };
        addToCart(product);

        addBtn.textContent = "✔ Added succesfully!";
        setTimeout(() => {addBtn.textContent = "Add to cart";}, 1200);
    });
}

const paypalContainer = document.getElementById("paypal-button-container");
  if (paypalContainer && sizeSelect) {
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: '29.99' }
                }]
        });
    },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('Danke für deinen Kauf, ' + details.payer.name.given_name + '!');
            });
        }
    }).render('#paypal-button-container');

} else {
    console.error("PayPal SDK wurde nicht geladen");
}

})


