/* ====== SIMPLE CART USING localStorage ====== */
const CART_KEY = 'f1_cart_v1';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function addToCart(item) {
  const cart = getCart();
  // merge by sku+options
  const idx = cart.findIndex(p => p.sku === item.sku && p.option === item.option);
  if (idx > -1) { cart[idx].qty += item.qty || 1; }
  else { cart.push({ ...item, qty: item.qty || 1 }); }
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
  const el = document.getElementById('cart-count');
  if (!el) return;
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  el.textContent = count > 99 ? '99+' : count;
}

/* Bind "Add to Cart" buttons on product pages */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sku = btn.dataset.sku;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const img = btn.dataset.img || '';
      const option = btn.dataset.option || '';
      addToCart({ sku, name, price, img, option, qty: 1 });
      // Optional: go to cart after adding
      if (btn.dataset.gotoCart === 'true') {
        window.location.href = 'cart.html';
      } else {
        btn.textContent = 'Im Warenkorb ✔';
        setTimeout(()=> (btn.textContent = 'In den Warenkorb'), 1200);
      }
    });
  });

  // If on cart page, render cart and mount PayPal
  if (document.getElementById('cart-page')) {
    renderCart();
  }
});

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
