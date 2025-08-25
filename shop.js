// Warenkorb aus LocalStorage laden
let cart = JSON.parse(localStorage.getItem("f1_cart_v1")) || [];

// Produkt-Infos
const selectQuantity = document.getElementById("quantity");
const addToCartBtn = document.querySelector(".add-to-cart");
const paypalNowDiv = document.querySelector(".paypal-now");
const cartCount = document.querySelector(".cart-count");

function getCart(){
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product) {
    const cart = getCart();
    const idx = cart.findIndex(p => p.name === product.name && p.option === product.option);
    if (idx > -1) {
        cart[idx].qty += product.qty || 1;
    } else {
        cart.push({...product, qty: product.qty || 1});
    }
    saveCart(cart);
}

function updateCartCount() {
    const countE1 = document.getElementById("cart-count");
    if (!countE1) return;
    const total = getCart().reduce((sum,i)=>sum+i.qty,0);
    countE1.textContent = total > 99 ? "99+" : total;
}

document.addEventListener("DOMContentLoaded", ()=>{
    updateCartCount();

    const addToCartBtn = document.querySelector("add-to-cart");
    if(addToCartBtn) {
        addToCartBtn.addEventListener("click", ()=>{
            const qtySelect = document.getElementById("qzantity");
            const price = parseFloat(qtySelect.value);
            const product = {
                name: addToCartBtn.dataset.product,
                price: price,
                qty: 1,
                option: qtySelect.options[qtySelect.selectedIndex].text
            };
            addToCart(product);
            addToCartBtn.textContent = "✔ Hinzugefügt!";
            setTimeout(()=>addToCartBtn.textContent="In den Warenkorb", 1500);
        })
    }
})


// PayPal Button rendern
paypal.Buttons({
    createOrder: function (data, actions) {
        return actions.order.create({
            purchase_units: [{
                description: addToCartBtn.dataset.product,
                amount: { value: selectQuantity.value }
            }]
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
            alert("Danke für deinen Kauf, " + details.payer.name.given_name + "!");
        });
    }
}).render(paypalNowDiv);
