//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");
//const date = require(__dirname + "/date.js");
const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = []; 


// mongoDB initilization 
//mongodb+srv://admin-tushar:<password>@cluster0.o7ysl.mongodb.net/<dbname>?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://admin@cluster0.o7ysl.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
	name: String
};

const Item = mongoose.model("Item", itemsSchema); 

//creating the mongoose document 

const item1 = new Item({
	name: "Welcome to your todo list!"
});

const item2 = new Item({
	name: "Hit the + button to add a new item."
});

const item3 = new Item({
	name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


// new schema for the new list.

const listSchema ={
	name: String,
	items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

	Item.find({}, function(err, foundItems){
		if (foundItems.length === 0){
			Item.insertMany(defaultItems, function(err){
				if (err) {
					console.log(err);
				} else {
					console.log ("Successfully saved default items to DB.");
				}
			});
			res.redirect("/");
		} else {
			res.render("list", {listTitle: "Today", newListItems: foundItems});
			}
		
		res.render("list", {listTitle: "Today", newListItems: foundItems});
	});

	
});

app.post("/", function(req, res){

	const itemName = req.body.newItem;
	const listName = req.body.list;
  
  
	const item = new Item({
		name: itemName
	});
	
	if(listName === "Today"){
		item.save();
		res.redirect("/");
	}else{
		List.findOne({name: listName}, function(err, foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		})
	}
});


app.post("/delete", function(req, res){
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;
	
	if (listName === "Today") {
		Item.findByIdAndRemove(checkedItemId, function(err){
			if(!err){
				console.log("Sucessfully deleted checked item.");
				res.redirect("/");
			}
		});
	}else{
		List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}},function(err, foundList){
			if(!err){
				res.redirect("/" +listName);
			}
		});
	}
});

// creating the dynamic route link 

app.get("/:customListName", function(req, res){
	const customListName= _.capitalize(req.params.customListName);
	
	List.findOne({name: customListName}, function(err, foundList){
		if(!err){
			if (!foundList){
				//Create a new List 
				const list = new List({
				name: customListName,
				items: defaultItems
				});
		
				list.save();
				
				res.redirect("/" + customListName)
			}else{
				// show an existing list
				
				res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
				
			}
		}
	});
	
	
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
