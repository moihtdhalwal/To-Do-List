//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mohit:Test@cluster0-egc1q.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list!"
});

const item2 = new Item({
  name: "Hit the + button to add new item."
});

const item3 = new Item({
  name: "Click checkbox to remove an item."
});

const defauItems = [item1, item2, item3];



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defauItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added default Items.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();

    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if (listName === "Today") {
  Item.findByIdAndRemove(checkedItemId, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully Removed.");
      res.redirect("/");
    };
  })
} else {
  List.findOneAndUpdate({
    name: listName
  }, {
    $pull: {
      items: {
        _id: checkedItemId
      }
    }
  }, function(err, foundList) {
    if (!err) {
      res.redirect("/" + listName);
    }
  });
}

});
// });

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list.
        const list = new List({
          name: customListName,
          items: defauItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  })


});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server has started successfully");
});
