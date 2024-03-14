document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    console.log('Conexión establecida con el servidor WebSocket');

    const addProductForm = document.getElementById('add-product-form');

    // Envío de formulario para agregar producto
    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(addProductForm);
        const title = formData.get('title');
        const description = formData.get('description');
        const price = formData.get('price');
        const thumbnails = formData.get('thumbnails');
        const code = formData.get('code');
        const stock = formData.get('stock');
        const category = formData.get('category');

        // Validación 
        if (!title || !description || !price || !code || !stock || !category) {
            return;
        }

        const productData = { title, description, price, thumbnails, code, stock, category };

        // Enviar datos 
        socket.emit('addProduct', productData);
        console.log('Producto enviado:', productData);
    });

    // Escuchar el evento newProductAdded para agregar el nuevo producto a la lista de realtimeproducts
    socket.on('newProductAdded', (productData) => {
        console.log('Nuevo producto agregado:', productData);
        // Imprimir el nuevo producto en la lista 
        const productList = document.getElementById('product-list');
        const newProductItem = document.createElement('li');
        newProductItem.innerHTML = `
            <h2>${productData.title}</h2>
            <img src="${productData.thumbnails}">
            <p>${productData.description}</p>
            <p>$${productData.price}</p>
        `;
        productList.appendChild(newProductItem);
    });
});
