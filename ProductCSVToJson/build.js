"use strict";
const _ = require('lodash');
const products = require('./products.json');
const fs = require('fs');
let productImports = [];

_.forEach(products, function(product, index){
	let specs = (typeof product.specs === "string" && product.specs != null) ? JSON.stringify(product.specs.split("|")) : JSON.stringify([]);
	let bullets = (typeof product.bullets === "string" && product.bullets != null) ? JSON.stringify(product.bullets.split("|")) : JSON.stringify([]);

	let productModel = `UPSERT INTO product (KEY, VALUE) VALUES ("${product.product_id}", {
		"productId": "${product.product_id}",
		"description": "${product.description}",
		"type": "${product.type}",
		"brand": "${product.brand}",
		"barcode": "${product.barcode}",
		"description": "${product.description}",
		"bullets": ${bullets},
		"Specs": ${specs},
		"imgId": "${product.img_id}",
		"itemNum": "${product.item_num}",
		"modelNum": "${product.model_num}",
		"lgImg": "${product.lg_img}",
		"smImg": "${product.sm_img}",
		"rating": "${product.rating}",
		"numRatings": "${product.num_ratings}",
		"networkPrice": "${product.price}"
	});`;

	productImports.push(productModel);
});

console.log(productImports[20]);

fs.writeFile("products.nql", productImports.join("\n"), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});