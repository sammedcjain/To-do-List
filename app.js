//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sammedcjain:mongodb8762@cluster0.gldyajt.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true, useFindAndModify: false });

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1=new Item({
  name:"List1"
});
const item2=new Item({
  name:"List2"
});
const item3=new Item({
  name:"List3"
});

const defaultItems= [item1,item2,item3];

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {
  Item.find({}).then(
    (result) => {
      if (result.length===0){
        Item.insertMany(defaultItems).then(
          (result) => {
             console.log("Items added succesfully");
          }
        ).catch(
          (err) => {
             console.log(err);
          }
        );
        res.redirect("/");
      }else{
       res.render("list", {listTitle:"Today", newListItems: result});
           }
  }
  ).catch(
    (err) => {
       console.log(err);
    }
  );

});

const listSchema= {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

app.get("/:custom", function(req,res){
  const custom = _.capitalize(req.params.custom);

  List.findOne({name:custom},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name:custom,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+custom);
    }
    else{
      res.render("list", {listTitle:foundlist.name, newListItems: foundlist.items});
    }
  }
})


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item=new Item({
    name:itemName
  })

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==='Today'){
    Item.findByIdAndRemove(checkedItemId).then(
      (result) => {
         console.log("Items deleted succesfully");
         res.redirect("/");
      }
    ).catch(
      (err) => {
         console.log(err);
      }
    );

  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItemId } } },function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    })
  }



})



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port==null || port ==""){
  port=3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server has started successfully");
});
