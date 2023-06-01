//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://Yahmis:Muhammadu1@firstcluster.5qzkq2e.mongodb.net/?retryWrites=true&w=majority/todolistDB", {useNewUrlParser: true});

const Item = new mongoose.model("Item",{
  name: String
});

const List = new mongoose.model("List", {
  name: String,
  items: []
});


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name:  "Click + to add an item"
});

const defaultItems = [item1, item2];
// Item.insertMany(defaultItems).then(function(err){
//   console.log("Items pushed successfully!");
// });

app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  });

});

app.get("/:customListName", function(req,res){ 

  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}).then(function(foundList){
    if (!foundList){
     //Create a new list
    const list = new List({
    name: customListName,
    items: defaultItems
  });
  list.save();
  res.redirect("/" + customListName);
    } else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(error){
    console.log("Error caught " + error);
  });
});


app.post("/", function(req, res){

  const listName = req.body.list;
  const itemName = req.body.newItem;
  const newestItem = new Item ({
    name: itemName
  });
  if (listName === "Today"){
    newestItem.save()
    res.redirect("/"); 
  } else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(newestItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function(){
      console.log("Successfully removed Item");
    }).catch(function(error){
      console.log("Caught Error is " + error);
    });
    res.redirect("/");

  } else{
   List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(foundList){
    foundList.save()
    res.redirect("/" + listName);
   });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});