// ===============================
// 方劉兄食品 FangLiu Food Co.
// Node.js + Express 伺服器主程式
// ===============================

// 1. 載入必要模組
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

// 2. 建立 app
const app = express();
const PORT = process.env.PORT || 3000;

// 3. 啟用中介層（middleware）
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 4. 嘗試連接 MongoDB，如果沒有設定就用內存模式
const MONGODB_URI = process.env.MONGODB_URI;
let useMemoryStore = true;

const memory = {
  products: [
    { _id: 'p1', name: '蒜香全唐雞', price: 499, image: '/1.jpg' },
    { _id: 'p2', name: '唐排', price: 299, image: '/2.jpg' },
    { _id: 'p3', name: '唐湯', price: 199, image: '/3.jpg' }
  ],
  cart: [],
  orders: []
};

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      useMemoryStore = false;
    })
    .catch(err => {
      console.warn('⚠️ MongoDB connect failed, using in-memory data');
      useMemoryStore = true;
    });
}

// 5. API 路由 (簡易內建)
app.get('/api/products', (req, res) => {
  res.json({ ok: true, data: memory.products });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1, user = 'guest' } = req.body || {};
  if (!productId) return res.status(400).json({ ok: false, error: '缺少商品 ID' });

  const exist = memory.cart.find(c => c.productId === productId && c.user === user);
  if (exist) exist.quantity += Number(quantity);
  else memory.cart.push({ productId, quantity: Number(quantity), user });
  res.json({ ok: true, message: '已加入購物車' });
});

app.get('/api/cart', (req, res) => {
  const user = req.query.user || 'guest';
  const items = memory.cart.filter(c => c.user === user);
  const detailed = items.map(it => {
    const prod = memory.products.find(p => p._id === it.productId);
    return {
      productId: it.productId,
      productName: prod?.name || '未知商品',
      price: prod?.price || 0,
      quantity: it.quantity
    };
  });
  res.json({ ok: true, data: detailed });
});

app.post('/api/checkout', (req, res) => {
  const { email = 'guest@example.com', user = 'guest' } = req.body || {};
  const userKey = email || user;
  const cartItems = memory.cart.filter(c => c.user === userKey);
  if (!cartItems.length) return res.status(400).json({ ok: false, error: '購物車為空' });

  const items = cartItems.map(it => {
    const prod = memory.products.find(p => p._id === it.productId);
    return {
      productName: prod?.name || '未知商品',
      quantity: it.quantity,
      price: prod?.price || 0
    };
  });

  const order = {
    items,
    user: userKey,
    orderTime: new Date(),
    status: '待處理'
  };

  memory.orders.push(order);
  memory.cart = memory.cart.filter(c => c.user !== userKey);
  res.json({ ok: true, message: '購買成功', data: order });
});

app.get('/api/orders', (req, res) => {
  const user = req.query.user || 'guest';
  const orders = memory.orders.filter(o => o.user === user);
  res.json({ ok: true, data: orders });
});

// 6. 前端靜態檔案 (HTML, CSS, JS)
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// 7. 預設導向首頁
app.get(['/', '/process', '/form'], (req, res) => {
  const map = {
    '/': 'index.html',
    '/process': 'process.html',  // ✅ 這行改成 process
    '/form': 'form.html'
  };
  res.sendFile(path.join(PUBLIC_DIR, map[req.path] || 'index.html'));
});



// 8. 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
