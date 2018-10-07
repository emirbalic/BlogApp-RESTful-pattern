var express             = require("express"),
    methodOverride      = require("method-override"),
    expressSanitizer    =require("express-sanitizer"),
    app                 = express(),
    bodyParser          = require ("body-parser"),
    mongoose            = require ("mongoose");
    
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer()); // the only requirement is that this statement is after the --use bodyParser-- 


//MONGOOSE/MODEL SCHEMA
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1538660467224-67924aea620a?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=68f21186a3b31e5d66113c6b1f860930&auto=format&fit=crop&w=934&q=80",
//     body: "Hello from Blog posts"
// });

app.get("/", function(req, res) {
    res.redirect("/blogs");
})

app.get('/blogs', function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs:blogs});
        }
    });
});

//RESTFUL ROUTES

//NEW ROUTE
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//CREATE ROUTES
app.post("/blogs", function(req, res) {
   req.body.blog.body = req.sanitize(req.body.blog.body);
   
   Blog.create(req.body.blog, function(err, newBlog){
      if(err){
          console.log(err);
          res.render("new");
      } else {
          res.redirect("/blogs")
      }
   }); 
});

// SHOW ROUTE

app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   }) 
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
   req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
//       (node:5593) DeprecationWarning: collection.findAndModify is deprecated. 
//       Use findOneAndUpdate, findOneAndReplace or findOneAndDelete instead.
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs/" + req.params.id)
       }
   })
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
   Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs");
       }
       
   })
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Is Running - Blog App")
})
