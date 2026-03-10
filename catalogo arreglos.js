const WHATSAPP_NUMERO = "584126691482";
const cap = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : "";

document.addEventListener('DOMContentLoaded', () => {
    const buscador = document.querySelector('.search-box input') || document.querySelector('input[type="text"]');
    
    if (buscador) {
        buscador.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.product-card');
            
            cards.forEach(card => {
                const nombre = card.querySelector('h3').innerText.toLowerCase();
                const descripcion = card.querySelector('p').innerText.toLowerCase();
                
                if (nombre.includes(term) || descripcion.includes(term)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }
});

// --- FUNCIÓN PARA DAR FORMATO DE MILES ---
const formatearPrecio = (num) => {
    return num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- FUNCIÓN PARA ORDENAR POR PRECIO ---
window.sortByPrice = function(order) {
    const grid = document.querySelector('.catalogo-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    cards.forEach(card => card.style.display = "block");
    cards.sort((a, b) => {
        const priceA = parseFloat(a.getAttribute('data-price'));
        const priceB = parseFloat(b.getAttribute('data-price'));
        return order === 'low' ? priceA - priceB : priceB - priceA;
    });
    grid.innerHTML = "";
    cards.forEach(card => {
        card.style.animation = "fadeIn 0.4s ease forwards";
        grid.appendChild(card);
    });
};

// --- FUNCIÓN DEL MODAL DE PRODUCTO ---
let modalQty = 1;

window.openModal = function(nombre, detalle, precio, imagen) {
    const modalRoot = document.getElementById('amore-modal-root');
    if (!modalRoot) return;
    
    modalQty = 1;

    modalRoot.innerHTML = `
        <style>
            #amore-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);
                display: flex; align-items: center; justify-content: center; z-index: 10000;
                padding: 10px;
            }
            .modal-card {
                background: #fff; width: 95%; max-width: 330px; border-radius: 18px;
                overflow: hidden; position: relative; text-align: center; padding-bottom: 20px;
                animation: scaleUp 0.3s ease; font-family: 'Lato', sans-serif;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            
            .btn-cerrar {
                position: absolute; top: 10px; right: 10px; font-size: 26px;
                color: #5B4131; cursor: pointer; font-weight: bold; z-index: 10001;
                width: 30px; height: 30px; line-height: 28px;
            }
            .modal-img { width: 100%; height: 300px; object-fit: cover; display: block; background: #f9f9f9; }
            .modal-body { padding-right 10px; justify-content: center; }
            .modal-price { font-size: 1.5rem; font-weight: 800; margin: 8px 0; color: #000; }
            
            .qty-selector {
                display: flex; align-items: center; justify-content: center; gap: 15px; margin: 10px 0;
            }
            .qty-btn {
                width: 30px; height: 30px; border: 1px solid #F3D4B9; background: white;
                border-radius: 50%; cursor: pointer; font-weight: bold; color: #5B4131;
            }

            .btn-amore {
                width: 92%; height: 45px; border-radius: 10px; border: none; margin: 8px auto;
                font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700;
                cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
                transition: background-color 0.3s ease;
            }
            .btn-cart { background: #F3D4B9; color: #5B4131; }
            .btn-cart:hover { background: #eec4a0; }
            
            .btn-buy { background: #9ad0AD; color: #5B4131; }
            .btn-buy:hover { background: #8bc39e; }
        </style>
        
        <div id="amore-modal-overlay" onclick="if(event.target === this) closeAmoreModal()">
            <div class="modal-card">
                <span class="btn-cerrar" onclick="closeAmoreModal()">&times;</span>
                <img src="${imagen}" class="modal-img">
                <div class="modal-body">
                    <h2 style="margin:0; font-size: 1.3rem; font-family:'Playfair Display', serif; color: #5B4131;">${cap(nombre)}</h2>
                    <p style="color:#828282; font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; margin: 5px 0;">${detalle}</p>
                    <div class="modal-price">${precio}</div>
                    
                    <div class="qty-selector">
                        <button class="qty-btn" onclick="updateModalQty(-1)">-</button>
                        <span id="modal-qty-val" style="font-weight:bold; font-size:1.1rem;">1</span>
                        <button class="qty-btn" onclick="updateModalQty(1)">+</button>
                    </div>
                    
                    <button class="btn-amore btn-cart" onclick="addToBag('${nombre}', '${detalle}', '${precio}', '${imagen}')">
                        Añadir a la Bolsa
                    </button>
                    <button class="btn-amore btn-buy" onclick="buyNow('${nombre}', '${detalle}', '${precio}')">
                        Comprar Ahora
                    </button>
                </div>
            </div>
        </div>
    `;
    modalRoot.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.updateModalQty = (val) => {
    modalQty = Math.max(1, modalQty + val);
    const label = document.getElementById('modal-qty-val');
    if (label) label.innerText = modalQty;
};

window.closeAmoreModal = () => {
    const modalRoot = document.getElementById('amore-modal-root');
    if (modalRoot) {
        modalRoot.style.display = 'none';
        modalRoot.innerHTML = '';
        document.body.style.overflow = 'auto';
    }
};

window.addToBag = (nombre, marca, precio, imagen) => {
    const cart = JSON.parse(localStorage.getItem('amore_carrito')) || [];
    const valorNumerico = parseFloat(precio.replace(/[^0-9.-]+/g, ""));
    cart.push({ 
        nombre, 
        marca, 
        precio: valorNumerico, 
        cantidad: modalQty, 
        imagen
    });
    localStorage.setItem('amore_carrito', JSON.stringify(cart));
    alert("✨ ¡Añadido con éxito!");
    closeAmoreModal();
};

window.buyNow = (nombre, detalle, precio) => {
    const mensaje = `✨ *NUEVO PEDIDO DE ARREGLO* ✨\n\nHola Amore, me gustaría comprar:\n\n▪️ *Producto:* ${nombre}\n▫️ Detalle: ${detalle}\n▫️ Cantidad: ${modalQty}\n▫️ Precio unitario: ${precio}`;
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`, '_blank');
};