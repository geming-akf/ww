const API_BASE = '/api';

function qs(s){ return document.querySelector(s); }
function ce(tag, cls){ const el = document.createElement(tag); if(cls) el.className = cls; return el; }

async function fetchJSON(url, options){
  const res = await fetch(url, options);
  return res.json();
}

// ====== 通用：購物車徽章更新 ======
async function updateCartBadge(){
  const badge = qs('#cart-badge');
  if(!badge) return;
  const data = await fetchJSON(`${API_BASE}/cart?user=guest`);
  const total = (data.data || []).reduce((s, it) => s + (it.quantity || 0), 0);
  badge.textContent = total;
}

// ====== 產品頁：載入商品 + 綁定購買 ======
async function loadProducts(){
  const grid = qs('#products-grid');
  if(!grid) return;
  const { data } = await fetchJSON(`${API_BASE}/products`);
  grid.innerHTML = '';
  data.forEach(prod => {
    const card = ce('div','card');
    const img = ce('img'); img.src = prod.image; img.alt = prod.name;
    const h3 = ce('h3'); h3.textContent = prod.name;
    const price = ce('div','price'); price.textContent = `NT$${prod.price}`;
    const btn = ce('button','btn buy'); btn.textContent = '加入購物車';
    btn.addEventListener('click', async ()=>{
      const res = await fetchJSON(`${API_BASE}/cart`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ productId: prod._id, quantity:1, user:'guest' })
      });
      alert(res.ok ? '已加入購物車！' : (res.error || '加入失敗'));
      updateCartBadge();
    });
    card.append(img,h3,price,btn);
    grid.append(card);
  });
  updateCartBadge();
}

// ====== 表單頁 ======
function bindForm(){
  const form = qs('#contact-form');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = qs('#email').value || 'guest@example.com';
    const res = await fetchJSON(`${API_BASE}/checkout`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email })
    });
    if(res.ok){
      alert('購買成功！我們已收到您的資料。');
    } else {
      alert(res.error || '提交失敗');
    }
  });
}

// ====== 啟動 ======
document.addEventListener('DOMContentLoaded', ()=>{
  loadProducts();
  bindForm();
  updateCartBadge();
});
