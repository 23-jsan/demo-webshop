const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
  mango: { name: "Mango", emoji: "🥭" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return {};
    const parsed = JSON.parse(basket);
    // Handle backward compatibility: convert old array format to new object format
    if (Array.isArray(parsed)) {
      const basketObj = {};
      parsed.forEach((product) => {
        basketObj[product] = (basketObj[product] || 0) + 1;
      });
      localStorage.setItem("basket", JSON.stringify(basketObj));
      return basketObj;
    }
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return {};
  }
}

function addToBasket(product) {
  const basket = getBasket();
  basket[product] = (basket[product] || 0) + 1;
  localStorage.setItem("basket", JSON.stringify(basket));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  const basketEntries = Object.entries(basket);
  if (basketEntries.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  basketEntries.forEach(([product, quantity]) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      const countText = quantity > 1 ? ` <span class="basket-count">(x${quantity})</span>` : "";
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>${countText}`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  const totalItems = Object.values(basket).reduce((sum, quantity) => sum + quantity, 0);
  if (totalItems > 0) {
    indicator.textContent = totalItems;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
