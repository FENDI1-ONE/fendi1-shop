// Warenkorb aus LocalStorage laden


// Produkt-Infos
const selectQuantity = document.getElementById("quantity");
const addToCartBtn = document.querySelector(".add-to-cart");
const paypalNowDiv = document.querySelector(".paypal-now");
const cartCount = document.querySelector(".cart-count");


if(paypalNowDiv){// PayPal Button rendern
paypal.Buttons({
    createOrder: function (data, actions) {
        const selectedOption = selectQuantity.options[selectQuantity.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price);

        return actions.order.create({
            purchase_units: [{
                description: addToCartBtn.dataset.product,
                amount: { value: price.toFixed(2) }
        }]
            
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(details=> {
            alert("Danke für deinen Kauf, " + details.payer.name.given_name + "!");
        });
    }
}).render(paypalNowDiv);
}

function renderCart() {
    const cart= getCart();
    const cartContainer = document.getElementById("cart-items");
    if (!cartContainer) return;

    cartContainer.innerHTML ="";
    cart.forEach(item=> {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-thumb">
            <span>${item.name} (${item.option})</span>
            <span>${(item.price * item.qty).toFixed(2)} €</span>
        `;
        cartContainer.appendChild(div);
    });
}