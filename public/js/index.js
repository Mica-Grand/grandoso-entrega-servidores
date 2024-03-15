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
        
    });

    socket.on('productListUpdated', (updatedProducts) => {
        console.log('Lista de productos actualizada:', updatedProducts);
        // Actualizar la interfaz de usuario con la lista actualizada de productos

        renderProductList(updatedProducts);
    });

    // Escuchar el evento de click eliminar
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-product')) {
            const productId = parseInt(event.target.dataset.id); 
            // Emitir un evento al servidor para eliminar el producto
            socket.emit('deleteProduct', productId); 
        }
    });
    // Escuchar el evento productDeleted para eliminar el producto de la lista en tiempo real
    socket.on('productDeleted', (productId) => {
        console.log('Producto eliminado:', productId);
    })

    // Escuchar el evento productListUpdated para actualizar la lista de productos en tiempo real
    socket.on('productListUpdated', (updatedProducts) => {
        console.log('Lista de productos actualizada:', updatedProducts);
        // Actualizar la interfaz de usuario con la lista actualizada de productos
    
        renderProductList(updatedProducts);
    });

    
    function renderProductList(products) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
        products.forEach(product => {
            const newProductItem = document.createElement('li');
            newProductItem.setAttribute('id', `product-${product.id}`);
            newProductItem.innerHTML = `
            <h2>${product.title}</h2>
            <img src="${product.thumbnails}">
            <p>${product.description}</p>
            <p>$${product.price}</p>
            <button class="delete-product" data-id="${product.id}">Eliminar</button>
        `;
            productList.appendChild(newProductItem);
        });
    }



});
