import { ProductOrders } from './../models/product-orders.module';
import { Component, OnInit } from '@angular/core';
import { ProductOrder } from '../models/product-order.module';
import { EcommerceService } from "../services/EcommerceService";
import { Subscription } from "rxjs/internal/Subscription";
import { Product } from '../models/product.module';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
    productOrders: ProductOrder[] = [];
    products: Product[] = [];
    selectedProductOrder: ProductOrder | undefined;
    private shoppingCartOrders: ProductOrders = new ProductOrders(); // Inicialização
    sub: Subscription = new Subscription(); // Inicialização
    productSelected: boolean = false;

    constructor(private ecommerceService: EcommerceService) {
        this.selectedProductOrder = undefined; // ou inicialize conforme necessário
    }

    ngOnInit() {
        this.productOrders = [];
        this.loadProducts();
        this.loadOrders();
    }

    addToCart(order: ProductOrder) {
        this.ecommerceService.SelectedProductOrder = order;
        this.selectedProductOrder = this.ecommerceService.SelectedProductOrder;
        this.productSelected = true;
    }

    removeFromCart(productOrder: ProductOrder) {
        let index = this.getProductIndex(productOrder.product);
        if (index > -1) {
            this.shoppingCartOrders.productOrders.splice(
                this.getProductIndex(productOrder.product), 1);
        }
        this.ecommerceService.ProductOrders = this.shoppingCartOrders;
        this.shoppingCartOrders = this.ecommerceService.ProductOrders;
        this.productSelected = false;
    }

    getProductIndex(product: Product): number {
        return this.ecommerceService.ProductOrders.productOrders.findIndex(
            value => value.product === product);
    }

    isProductSelected(product: Product): boolean {
        return this.getProductIndex(product) > -1;
    }

    loadProducts() {
        this.ecommerceService.getAllProducts()
            .subscribe(
                (products: Product[]) => { // Alteração do tipo de argumento
                    this.products = products;
                    this.products.forEach(product => {
                        this.productOrders.push(new ProductOrder(product, 0));
                    })
                },
                (error) => console.log(error)
            );
    }

    loadOrders() {
        this.sub = this.ecommerceService.OrdersChanged.subscribe(() => {
            this.shoppingCartOrders = this.ecommerceService.ProductOrders;
        });
    }

    reset() {
        this.productOrders = [];
        this.loadProducts();
        this.ecommerceService.ProductOrders.productOrders = [];
        this.loadOrders();
        this.productSelected = false;
    }
}
