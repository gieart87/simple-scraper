var request = require('request');
var cheerio = require('cheerio');
var mysql = require('mysql');
var htmlToText = require('html-to-text');

var con = mysql.createConnection({
 	host		: "localhost",
	user		: "root",
	password	: "root",
	database	: "scraperdb"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

var url_site = 'http://www.lazada.co.id/lenovo-vibe-k4-note-55-16-gb-hitam-gratisvrglasses-tambahangaransi-7307062.html';

request(url_site, function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  console.log("URL: " + url_site);
  console.log("Status code: " + response.statusCode);

  var $ = cheerio.load(body);

  var product_sku = $('#pdtsku').text().trim();

  var product_name = $('#prod_title').text().trim(); 

  var price = 0;
  var sale_price = 0;
  var percent_off = 0;

  if ($('#special_price_area').length > 0 && $('#special_price_area').hasClass('hidden') == false){
  	price = parseFloat($('.price_erase #price_box').text().replace(/\D/g,'')).toFixed(2);
  	sale_price = parseFloat($('#special_price_box').attr('content')).toFixed(2);
  }else{
  	price = parseFloat($('#special_price_box').attr('content')).toFixed(2);
  }

  var description = htmlToText.fromString($('#productDetails').html());

  var product_details = $('.product-description__block:nth-child(2)').html();

  var categories = [];
  $('.breadcrumb__list').find('a').each(function() {
  	categories.push($(this).text().trim());
  });
  
  var category_tree = categories.join(" > ");

  var brand = $('#prod_brand .prod_header_brand_action:nth-child(1) a').text().trim();

  console.log("Sku : " + product_sku);
  console.log("name : " + product_name);
  console.log("Price : " + price);
  console.log("Sale Price : " + sale_price);
  // console.log("Product Details : " + product_details);
  // console.log("Description : " + description);
  console.log("Categories : " + category_tree);
  console.log("Brand : " + brand);

  var query_sql = "INSERT INTO products (original_url,sku,name,price,sale_price,details,description,categories,brand) VALUES('" + url_site + "','" + product_sku + "','" + product_name + "','" + price + "','" + sale_price + "','" + product_details + "','" + description + "','" + categories + "','" + brand + "')";
  con.query(query_sql);
  
  process.exit();
});