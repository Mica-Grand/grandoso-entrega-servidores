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

    // Manejar el evento 'addProduct'
    socket.on('addProduct', async (productData) => {
        try {
            if (!productData.thumbnails) {
                productData.thumbnails = "public/img/image.jpeg"; 
            }
            // Agregar el nuevo producto utilizando ProductManager
            await manager.addProduct(productData.title, productData.description, productData.code, productData.price, productData.stock, productData.category, productData.thumbnails);
            console.log('Producto agregado:', productData);

            // Emitir el evento newProductAdded a todos los clientes
            socketServer.emit('newProductAdded', productData);
        } catch (error) {
            console.error('Error al agregar el producto:', error);
        }
    });

});