async function verNoDevueltos() {
  const res = await fetch('http://localhost:3000/rentas/no-devueltos');
  const data = await res.json();
  document.getElementById('salida').textContent = JSON.stringify(data, null, 2);
}
