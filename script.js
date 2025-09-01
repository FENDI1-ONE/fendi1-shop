/* ====== SIMPLE CART USING localStorage ====== */
const CART_KEY = 'f1_cart_v1';

const sizeSelect = document.getElementById("hoodie-quantity");
const addToCartBtn = document.querySelector(".add-to-cart");
const paypalNowDiv = document.querySelector(".paypal-now");
const cartCount = document.querySelector(".cart-count");

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function addToCart(product) {
  const cart = getCart();
  cart.push(product); 
  saveCart(cart);
}
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
  renderCart();
}
function clearCart() {
  saveCart([]);
  renderCart();
}
function cartTotal() {
  const cart = getCart();
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}
function updateCartCount() {
  const count = getCart().reduce((sum, p) => sum + p.qty, 0);
  if (cartCount) cartCount.textContent = count > 99 ? "99+" : count;
}

/* Bind "Add to Cart" buttons on product pages */


  // If on cart page, render cart and mount PayPal
  if (document.getElementById('cart-page')) {
    renderCart();
  }
;

/* Render cart table on cart.html */
function renderCart() {
  const wrap = document.getElementById('cart-page');
  if (!wrap) return;
  const tbody = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const emptyEl = document.getElementById('cart-empty');
  const cart = getCart();
  tbody.innerHTML = '';

  if (!cart.length) {
    emptyEl.style.display = 'block';
    document.getElementById('cart-has-items').style.display = 'none';
    totalEl.textContent = '0,00 €';
    // If PayPal rendered earlier, clear it:
    const pp = document.getElementById('paypal-button-container');
    if (pp) pp.innerHTML = '';
    return;
  }

  emptyEl.style.display = 'none';
  document.getElementById('cart-has-items').style.display = 'block';

  cart.forEach((item, idx) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td><img class="cart-row-img" src="${item.img || 'assets/placeholder.png'}" alt=""></td>
      <td>
        <div style="font-weight:700">${item.name}</div>
        ${item.option ? `<div style="opacity:.7;font-size:14px">${item.option}</div>` : ''}
        <div style="opacity:.7;font-size:14px">SKU: ${item.sku}</div>
      </td>
      <td>${item.price.toFixed(2)} €</td>
      <td style="white-space:nowrap">
        <button class="btn btn-light" data-qty-minus="${idx}">–</button>
        <span style="display:inline-block; min-width:28px; text-align:center">${item.qty}</span>
        <button class="btn btn-light" data-qty-plus="${idx}">+</button>
      </td>
      <td>${(item.price * item.qty).toFixed(2)} €</td>
      <td><button class="btn btn-danger" data-remove="${idx}">Entfernen</button></td>
    `;
    tbody.appendChild(tr);
  });

  // qty handlers
  tbody.querySelectorAll('[data-qty-minus]').forEach(b=>{
    b.addEventListener('click', () => {
      const i = parseInt(b.dataset.qtyMinus,10);
      const cart = getCart();
      cart[i].qty = Math.max(1, cart[i].qty - 1);
      saveCart(cart); renderCart();
    });
  });
  tbody.querySelectorAll('[data-qty-plus]').forEach(b=>{
    b.addEventListener('click', () => {
      const i = parseInt(b.dataset.qtyPlus,10);
      const cart = getCart();
      cart[i].qty += 1;
      saveCart(cart); renderCart();
    });
  });
  tbody.querySelectorAll('[data-remove]').forEach(b=>{
    b.addEventListener('click', () => {
      removeFromCart(parseInt(b.dataset.remove,10));
    });
  });

  const total = cartTotal();
  totalEl.textContent = total.toFixed(2) + ' €';

  // Mount PayPal buttons if SDK present
  if (window.paypal && document.getElementById('paypal-button-container')) {
    document.getElementById('paypal-button-container').innerHTML = '';
    paypal.Buttons({
      style: { layout: 'vertical' },
      createOrder: (_data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: { currency_code: 'EUR', value: total.toFixed(2) },
            description: 'FENDI1 Shop – Bestellung'
          }]
        });
      },
      onApprove: (_data, actions) => {
        return actions.order.capture().then(() => {
          alert('Danke für deinen Support ❤️');
          clearCart();
        });
      },
      onError: (err) => {
        console.error(err);
        alert('PayPal-Fehler. Versuch es bitte nochmal.');
      }
    }).render('#paypal-button-container');
  }
}

document.addEventListener('DOMContentLoaded', () => {

const images = {
  black: [
    "assets/hoodie1front.jpeg",
    "assets/hoodie1.jpeg",
    "assets/hoodie1left.jpeg",
    "assets/hoodie1right.jpeg"
  ],
  white : [
    "assets/hoodieWhiteFront.jpeg",
    "assets/hoodieWhiteBack.jpeg",
    "assets/hoodieWhiteLeftDetail.jpeg",
    "assets/hoodieWhiteRightDetail.jpeg"
  ]
};

const mainImage = document.getElementById("main-hoodie-image");
const thumbnailContainer = document.getElementById("thumbnail-container");
const boxes = document.querySelectorAll(".color-box");

console.log("Swatches gefunden:", boxes.length);

function setActiveColor(color) {
  boxes.forEach(b => {
    const isActive = b.dataset.color === color;
    b.classList.toggle('is-active', isActive);
  });
}

function loadThumbnails(color) {
  const list = images[color];
  if (!list) return;

  mainImage.src = list[0];


  thumbnailContainer.innerHTML = "";
  list.forEach(src => {
    const thumb = document.createElement("img");
    thumb.src = src;
    thumb.className = "thumbnail";
    thumb.addEventListener("click", () => mainImage.src = src); 
    thumbnailContainer.appendChild(thumb);
    });
  }

boxes.forEach(box => {
  box.addEventListener("click", () => {
    const color = box.dataset.color;
    loadThumbnails(color);
    setActiveColor(color);
  });
});

const defaultColor = "black";
setActiveColor(defaultColor);
loadThumbnails(defaultColor);
});

addToCartBtn.addEventListener("click", () => {
  const selectedSize = sizeSelect.value.split(" - ")[0];
  const activeColor = document.querySelector("color-box-is-active").dataset.color;
  const sku = `hoodie-${activeColor}-${selectedSize}`;
  const name = `Premium Hoodie ${activeColor} Größe ${selectedSize}`;
  const price = parseFloat(sizeSelect.value.split(" - ")[1].replace("€","").replace(",","."));
  const img = images[activeColor][0];

  addToCart({ sku, name, price, img, qty: 1});

  addToCartBtn.textContent = "✔ Hinzugefügt!";
  setTimeout(() => addToCartBtn.textContent = "In den Warenkorb", 1200);
});

updateCartCount();
