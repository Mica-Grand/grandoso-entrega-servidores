const fs = require('fs').promises;

class ProductManager {
    #products;
    static #lastId = 0;
    filePath;

    constructor(filePath) {
        this.filePath = filePath;
        this.#products = [];
        this.initialize();
    }

    async initialize() {
        try {
            await this.loadProductsFromFile();
            if (this.#products.length > 0) {
                ProductManager.#lastId = Math.max(...this.#products.map(product => product.id));
            }
        } catch (error) {
            console.error('Error initializing ProductManager:', error);
        }
    }
    async saveProductsToFile() {
        try {
            const data = JSON.stringify(this.#products, null, 2);
            await fs.writeFile(this.filePath, data);
        } catch (error) {
            console.error('Error saving products to file:', error);
        }
    }

    async loadProductsFromFile() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            this.#products = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.saveProductsToFile();
                console.log('The file products.json has been created.');
                return;
            }
            console.error('Error loading products from file:', error);
        }
    }

    async addProduct(title, description, code, price, stock, category, thumbnails) {
        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error("All fields are mandatory, except thumbnails.");
        }
    
        const newProduct = {
            id: ++ProductManager.#lastId,
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails,
            status: true
        };

        this.#products.push(newProduct);

        await this.saveProductsToFile();
        return newProduct;
    }

    getProducts() {
        this.loadProductsFromFile();
        return this.#products;
    }

    async getProductById(id) {
        await this.loadProductsFromFile();
        const product = this.#products.find(product => product.id === id);
        return product;
    }

    async updateProduct(id, updatedFields) {
        try {
            await this.loadProductsFromFile();
            const productIndex = this.#products.findIndex(product => product.id === id);
            if (productIndex === -1) {
                console.error("Product not found.");
                return;
            }

            this.#products[productIndex] = { ...this.#products[productIndex], ...updatedFields };

            await this.saveProductsToFile();
            return this.#products[productIndex];
        } catch (error) {
            console.error('Error updating product:', error);
        }
    }

    async deleteProduct(id) {
        await this.loadProductsFromFile();
        const productId = parseInt(id); 
    
        const productIndex = this.#products.findIndex(product => product.id === productId);
    
        if (productIndex !== -1) {
            this.#products.splice(productIndex, 1);
            await this.saveProductsToFile();
            console.log(`Product with ID ${productId} deleted successfully.`);
            return true;
        } else {
            console.error(`Product with ID ${productId} not found.`);
            return false;
        }
    }
}

module.exports = ProductManager;
