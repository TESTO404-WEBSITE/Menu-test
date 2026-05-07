const WHATSAPP_NUMBER = "212774071591"; // 0774071590 => Morocco format without +

const categories = ["All", "Drinks", "Coffee", "Food", "Desserts"];

const products = [
  {id:1, name:"Iced Mojito", cat:"Drinks", price:28, desc:"Menthe fraîche, citron vert, glace pilée et soda premium.", img:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=900&auto=format&fit=crop", tag:"Fresh"},
  {id:2, name:"Orange Juice", cat:"Drinks", price:22, desc:"Jus d’orange naturel pressé minute, frais et vitaminé.", img:"https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=900&auto=format&fit=crop", tag:"Natural"},
  {id:3, name:"Espresso", cat:"Coffee", price:14, desc:"Café court intense, extrait avec précision et crème dorée.", img:"https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=900&auto=format&fit=crop", tag:"Classic"},
  {id:4, name:"Cappuccino", cat:"Coffee", price:24, desc:"Espresso équilibré, lait mousseux et finition cacao.", img:"https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=900&auto=format&fit=crop", tag:"Creamy"},
  {id:5, name:"Royal Burger", cat:"Food", price:58, desc:"Steak juteux, fromage fondant, sauce maison et frites dorées.", img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop", tag:"Best Seller"},
  {id:6, name:"Pizza Margherita", cat:"Food", price:65, desc:"Pâte fine, mozzarella, basilic frais et sauce tomate italienne.", img:"https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=900&auto=format&fit=crop", tag:"Italian"},
  {id:7, name:"Chicken Tacos", cat:"Food", price:45, desc:"Poulet mariné, sauce fromagère, légumes croquants et frites.", img:"https://images.unsplash.com/photo-1613514785940-daed07799d9b?q=80&w=900&auto=format&fit=crop", tag:"Hot"},
  {id:8, name:"Chocolate Cake", cat:"Desserts", price:32, desc:"Gâteau chocolat fondant avec crème légère et topping premium.", img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=900&auto=format&fit=crop", tag:"Sweet"},
  {id:9, name:"Crêpe Nutella", cat:"Desserts", price:35, desc:"Crêpe fine, Nutella généreux, banane et éclats croustillants.", img:"https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=900&auto=format&fit=crop", tag:"Popular"}
];

let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("qr-cart")) || [];

const tabs = document.getElementById("categoryTabs");
const grid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");
const bottomCart = document.getElementById("bottomCart");
const bottomCartSummary = document.getElementById("bottomCartSummary");
const bottomCartItems = document.getElementById("bottomCartItems");
const bottomCartToggle = document.getElementById("bottomCartToggle");
const bottomConfirmBtn = document.getElementById("bottomConfirmBtn");
const bottomTableNumber = document.getElementById("bottomTableNumber");
const bottomClientNote = document.getElementById("bottomClientNote");

function saveCart(){ localStorage.setItem("qr-cart", JSON.stringify(cart)); }
function money(n){ return `${n} DH`; }

function renderCategories(){
  tabs.innerHTML = categories.map(cat => `<button class="cat-btn ${cat===activeCategory?'active':''}" onclick="setCategory('${cat}')">${cat}</button>`).join("");
}

function renderProducts(){
  const q = searchInput.value.toLowerCase().trim();
  const filtered = products.filter(p => (activeCategory === "All" || p.cat === activeCategory) && (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)));
  grid.innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}">
        <span class="badge">${p.tag}</span>
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-foot">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn" onclick="addToCart(${p.id})">Ajouter</button>
        </div>
      </div>
    </article>
  `).join("") || `<p class="empty">Aucun produit trouvé.</p>`;
}

function setCategory(cat){ activeCategory = cat; renderCategories(); renderProducts(); }

function addToCart(id){
  const item = cart.find(x => x.id === id);
  if(item) item.qty++;
  else cart.push({id, qty:1});
  saveCart(); renderCart(); showToast();
}

function changeQty(id, delta){
  const item = cart.find(x => x.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart(); renderCart();
}

function removeItem(id){ cart = cart.filter(x => x.id !== id); saveCart(); renderCart(); }
function clearCart(){ cart = []; saveCart(); renderCart(); }

function renderCart(){
  const count = cart.reduce((s,x)=>s+x.qty,0);
  const total = cart.reduce((s,x)=>{
    const p = products.find(p=>p.id===x.id); return s + (p.price*x.qty);
  },0);
  cartCount.textContent = count;
  cartTotal.textContent = money(total);
  renderBottomCart(count, total);
  if(cart.length === 0){ cartItems.innerHTML = `<div class="empty">Votre panier est vide.</div>`; return; }
  cartItems.innerHTML = cart.map(x=>{
    const p = products.find(p=>p.id===x.id);
    return `<div class="cart-item">
      <div>
        <h4>${p.name}</h4>
        <small>${money(p.price)} × ${x.qty} = ${money(p.price*x.qty)}</small>
        <div class="qty">
          <button onclick="changeQty(${p.id},-1)">−</button>
          <b>${x.qty}</b>
          <button onclick="changeQty(${p.id},1)">+</button>
        </div>
      </div>
      <button class="remove" onclick="removeItem(${p.id})">Supprimer</button>
    </div>`;
  }).join("");
}

function renderBottomCart(count, total){
  if(cart.length === 0){
    bottomCart.classList.remove("show", "expanded");
    bottomCart.setAttribute("aria-hidden", "true");
    bottomCartItems.innerHTML = "";
    bottomCartSummary.textContent = "0 article • 0 DH";
    bottomCartToggle.textContent = "Voir";
    return;
  }
  bottomCart.classList.add("show");
  if(!bottomCart.classList.contains("user-opened")){
    bottomCart.classList.remove("expanded");
  }
  bottomCart.setAttribute("aria-hidden", "false");
  bottomCartSummary.textContent = `${count} article${count > 1 ? "s" : ""} • ${money(total)}`;
  bottomCartToggle.textContent = bottomCart.classList.contains("expanded") ? "Fermer" : "Voir";
  bottomCartItems.innerHTML = cart.map(x=>{
    const p = products.find(p=>p.id===x.id);
    return `<div class="bottom-cart-line">
      <div class="bottom-item-info">
        <span>${p.name} × ${x.qty}</span>
        <small>${money(p.price*x.qty)}</small>
      </div>
      <button class="bottom-remove-btn" onclick="removeItem(${p.id})" aria-label="Supprimer ${p.name}">×</button>
    </div>`;
  }).join("");
}

function sendWhatsApp(){
  if(cart.length === 0){ alert("Le panier est vide."); return; }
  const drawerTable = document.getElementById("tableNumber").value.trim();
  const bottomTable = bottomTableNumber.value.trim();
  const table = drawerTable || bottomTable;
  if(!table){
    bottomCart.classList.add("show", "expanded");
    bottomTableNumber.classList.add("error");
    bottomTableNumber.focus();
    alert("Veuillez écrire le numéro de table.");
    return;
  }
  document.getElementById("tableNumber").value = table;
  bottomTableNumber.value = table;
  const drawerNote = document.getElementById("clientNote").value.trim();
  const bottomNote = bottomClientNote.value.trim();
  const note = drawerNote || bottomNote;
  document.getElementById("clientNote").value = note;
  bottomClientNote.value = note;
  const lines = cart.map((x,i)=>{
    const p = products.find(p=>p.id===x.id);
    return `${i+1}. ${p.name} x${x.qty} — ${p.price*x.qty} DH`;
  }).join("%0A");
  const total = cart.reduce((s,x)=>s + products.find(p=>p.id===x.id).price*x.qty,0);
  const msg = `Bonjour, nouvelle commande QR Menu:%0A%0ATable: ${table}%0A%0ACommande:%0A${lines}%0A%0ATotal: ${total} DH${note ? `%0A%0ANote: ${encodeURIComponent(note)}` : ""}%0A%0AMerci.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

function showToast(){ toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"), 1500); }

document.getElementById("openCartBtn").onclick = () => cartDrawer.classList.add("open");
document.getElementById("closeCartBtn").onclick = () => cartDrawer.classList.remove("open");
document.getElementById("sendWhatsAppBtn").onclick = sendWhatsApp;
document.getElementById("clearCartBtn").onclick = clearCart;
document.getElementById("howBtn").onclick = () => document.getElementById("howBox").scrollIntoView({behavior:"smooth"});
searchInput.addEventListener("input", renderProducts);
cartDrawer.addEventListener("click", e => { if(e.target === cartDrawer) cartDrawer.classList.remove("open"); });
bottomCartToggle.onclick = () => {
  bottomCart.classList.toggle("expanded");
  bottomCart.classList.toggle("user-opened", bottomCart.classList.contains("expanded"));
  bottomCartToggle.textContent = bottomCart.classList.contains("expanded") ? "Fermer" : "Voir";
};
bottomConfirmBtn.onclick = sendWhatsApp;
bottomTableNumber.addEventListener("input", () => bottomTableNumber.classList.remove("error"));

renderCategories();
renderProducts();
renderCart();
