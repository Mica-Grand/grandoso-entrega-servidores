const express = require('express');
const viewsRouter = require('./routes/views.router');
const handlebars = require('express-handlebars');
const { Server } = require('socket.io');
const ProductManager = require('./ProductManager');


const app = express();
const PORT = 8080;

//handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

app.use(express.static(`${__dirname}/../public`));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

app.use('/', viewsRouter);

const httpServer = app.listen(PORT, () => {
    console.log(`Server now listening on port ${PORT}`);
});

//servidor WS
const socketServer = new Server(httpServer);
app.set('ws', socketServer)

const manager = new ProductManager(`${__dirname}/../assets/products.json`);

socketServer.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Manejar el evento addProduct
    socket.on('addProduct', async (productData) => {
        try {
            if (!productData.thumbnails) {
                productData.thumbnails = "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg";
            }
            // Agregar el nuevo producto utilizando ProductManager
            const successAdded = await manager.addProduct(productData.title, productData.description, productData.code, productData.price, productData.stock, productData.category, productData.thumbnails);
            if (successAdded) {
                console.log('Producto agregado:', productData);

                const updatedProducts = manager.getProducts();
                // Emitir el evento productListUpdated con la lista actualizada de productos
                socketServer.emit('productListUpdated', updatedProducts);
            }
        } catch (error) {
            console.error('Error al agregar el producto:', error);
        }
    });

    // Manejar el evento deleteProduct
    socket.on('deleteProduct', async (productId) => {
        try {
            productId = parseInt(productId);

            // Eliminar el producto 
            const success = await manager.deleteProduct(productId);
            if (success) {
                console.log('Producto eliminado:', productId);
                // Obtener la lista actualizada 
                const updatedProducts = manager.getProducts();
                // Emitir el evento productListUpdated con la lista actualizada de productos
                socketServer.emit('productListUpdated', updatedProducts);
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    });
});