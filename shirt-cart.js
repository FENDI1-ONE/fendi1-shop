const CART_KEY = "f1_cart_v1";

const images = {
    black: [
        "assets/cclShirtBlackFront&Back.png",
        "assets/LayingDownShirtBlackCLLFront.png",
        "assets/LayingDownShirtBlackCLLBack.png",
        "assets/cclShirtBlackLeftDetail.png",
        "assets/cclShirtBlackRightDetail.png"
    ],
    white: [
        "assets/cclWhiteFront&Back.png",
        "assets/LayingDownCLLFrontWhite.png",
        "assets/LayingDownCLLBackWhite.png",
        "assets/cclWhiteLeftDetail.png",
        "assets/cclWhiteRightDetail.png"
    ]
};

const mainImage = document.getElementById("main-shirt");
const thumbnailContainer = document.getElementById("thumbnail-container");
const colorBoxes = document.querySelectorAll(".color-box");
const sizeSelect = document.getElementById("shirt-size");
const addToCartBtn = document.querySelector(".add-to-cart-btn");
const paypalContainer = document.getElementById("paypal-button-conatiner");
const selectedColor = document.querySelector("#color-box-group");
const selectedSize = document.querySelector("#shirt-size");

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
    const price = 35.99;
    paypalContainer.dataset.sku = sku;
    paypalContainer.dataset.price = price;
    paypalContainer.dataset.name = `FENDI1 Shirt-${selectedColor} ${selectedSize}`;
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

function setActiveColor(color) {
    colorBoxes.forEach(b => {
        const isActive = b.dataset.color === color;
        b.classList.toggle('is-active', isActive);
        b.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
}

let selectedColor ="black";
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

colorBoxes.forEach(box => {
    box.addEventListener("click", () => {
        colorBoxes.forEach(s => s.classList.remove("active"));
        box.classList.add("active");
        selectedColor = box.dataset.color;
        loadThumbnails(selectedColor);
        setActiveColor(selectedColor);
    });
});

sizeSelect.addEventListener("change", () => {
    selectedSize = sizeSelect.value;
    updateProductData();
})

const defaultColor = "black";
setActiveColor(defaultColor);
loadThumbnails(defaultColor);

const addBtn = document.querySelector(".add-to-cart-btn");

if (addBtn && sizeSelect) {
    addBtn.addEventListener("click", () => {
        const price = 29.99;
        const sku = `shirt-${selectedColor}-${selectedSize}`;
        const name = `FENDI1 SHIRT (${selectedColor}, ${selectedSize})`;
        const qty = 1;
        let img;
        if (selectedColor.toLowerCase() === "black") {
            img = images.black[0];
        } else if (selectedColor.toLowerCase() === "white") {
            img = images.white[0];
        }

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

        addBtn.textContent = "✔ added succesfully!";
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