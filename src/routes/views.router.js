const { Router } = require('express');
const router = Router();
const ProductManager = require('../ProductManager');

const manager = new ProductManager(`${__dirname}/../../assets/products.json`);

router.get('/realtimeproducts', async (_, res) => {
    try {

        const products = await manager.getProducts();

        const productsData = products.map(product => ({
            title: product.title,
            thumbnail: product.thumbnail,
            description: product.description,
            price: product.price,
            stock: product.stock,
            code: product.code
        }));

       
        res.render('realTimeProducts', {
            title: 'Productos en tiempo real',
            products: products,
            useWS: true,
            styles: [ 'index.css'],
            scripts: ['index.js'],
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error al cargar los productos');
    }
});

router.get('/', async (_, res) => {
    try {
        const products = await manager.getProducts();

        const productsData = products.map(product => ({
            title: product.title,
            thumbnail: product.thumbnail,
            description: product.description,
            price: product.price,
            stock: product.stock,
            code: product.code
        }));

        res.render('home', {
            products: productsData,
            useWS: false,
            styles: [ 'index.css'],
            scripts: ['index.js'],
        });
        } catch (err) {
            console.log(err);
            return res.status(404).send({message:'No se encontraron productos'})
    }
        

});

module.exports = {
    router,
    manager: manager
};