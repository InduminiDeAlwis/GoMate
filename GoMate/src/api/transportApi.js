export async function fetchTransportItems() {
  const url = 'https://dummyjson.com/products/category/automotive';
  const res = await fetch(url, {method: 'GET'});
  if (!res.ok) throw new Error('Network error');
  const json = await res.json();
  return json;
}
