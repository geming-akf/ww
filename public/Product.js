// ===============================
// Product.js — 前端控制商品按鈕功能
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  // 綁定所有加入購物車按鈕
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.id; // 按鈕上必須有 data-id 屬性

      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: productId,
            quantity: 1,
            user: 'guest'
          })
        });

        const data = await res.json();
        if (data.ok) {
          alert('✅ 已加入購物車');
        } else {
          alert('❌ 加入失敗：' + (data.error || '未知錯誤'));
        }
      } catch (err) {
        alert('⚠️ 伺服器錯誤，請稍後再試');
        console.error(err);
      }
    });
  });
});
