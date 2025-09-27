let cart = JSON.parse(localStorage.getItem("f1_cart_v1")) || [];

const cartContainer = document.getElementById("cart-items");
const totalSpan = document.getElementById("total");

// Warenkorb anzeigen
let total = 0;
cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} – ${item.price.toFixed(2)} €`;
    cartList.appendChild(li);
    total += item.price;
});
totalSpan.textContent = total.toFixed(2);

// PayPal Button für kompletten Warenkorb
paypal.Buttons({
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                description: "FENDI1 Warenkorb",
                amount: { value: total.toFixed(2) }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert("Danke für deinen Kauf, " + details.payer.name.given_name + "!");
            localStorage.removeItem("cart"); // Warenkorb leeren
        });
    }
}).render("#paypal-cart");
