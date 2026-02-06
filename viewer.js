const index = Number(location.hash.split("=")[1]);

browser.storage.local.get({ items: [] }).then(res => {
  const item = res.items[index];
  if (!item) return;

  const el = document.createElement(item.type === "image" ? "img" : "video");
  el.src = item.data;
  if (item.type === "video") el.controls = true;
  document.body.appendChild(el);
});
