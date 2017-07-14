var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
	user: "root",
	password: "7AnnivaL6",
	database: "bamazonDB"
});

connection.connect(function(err) {
  if (err) throw err;
  runSearch();
});

function runSearch() {
  var query = "SELECT * FROM products"
  //Pass to MySQL
  connection.query(query, function(err, res) {
    var idList = []
    for (var i = 0; i < res.length; i++){
    idList.push(res[i].product_name)
    }
inquirer
    .prompt([{
      name: "ID",
      type: "list",
      message: "What is the ID of the product you would like to buy?",
      choices: idList  
    },
    { name: "quantity",
      type: "input",
      message: "How many items do you wish to purchase?",
      validate: function (value) {
        var valid = !isNaN(parseFloat(value));
        return valid || 'Please enter a number';}
    }]
    )
    .then(function(answer) {
      var query = "SELECT product_name, stock_quantity FROM products WHERE product_name = ? AND stock_quantity >= ?";
      connection.query(query, [answer.ID, parseInt(answer.quantity)], function(err, res) {
                       console.log(err)
                        //If sufficient inventory, then update quantity and show cost of purchase
        if (res.length > 0) {
        var newQuantity = res[0].stock_quantity - parseInt(answer.quantity);

        query = "UPDATE products SET stock_quantity = ? WHERE product_name = ?" ;
        connection.query(query, [newQuantity, answer.ID], function(err2, res2){
            console.log(`${res[0].product_name} was ordered.  There are ${newQuantity} items left.`)
                runSearch();
                    })
                }
        else {
            //If not, no order placed
            console.log(`There is not enough ${answer.ID} inventory for your order.  Please order an amount less than ${answer.quantity}.`)
                runSearch();
                        }
                    })
    });

  })
}