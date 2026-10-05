const express = require("express")

const app = express()

const {initialize} = require("./databaseConnect/db.connect")
initialize()

const BookStore = require("./bookSchema/bookSchema")

const CategoryBook = require("./bookSchema/categorySchema")

const Cart = require("./bookSchema/cartSchema")

const WishList = require("./bookSchema/wishlistSchema")

const Address = require("./bookSchema/addressSchema")

const Order = require("./bookSchema/orderSchema")

app.use(express.json())

const cors = require("cors")
const corsOptions={
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

//New feeding Book Data 

async function book(newBook){
    try{
        const book = new BookStore(newBook)
        const saveBook = await book.save()
        return saveBook
    }catch(error){
        throw error
    }
}

app.post("/books", async (req, res)=>{
    try{
        const saveBook = await book(req.body)
        res.status(200).json({message: "Book added Successfully.", book: saveBook})
    }catch(error){
        res.status(500).json({error: "Failed to Add Book"})
    }
})

//All Books Show

async function allBook(){
    try{
        const allBooks =await BookStore.find()
        return allBooks
    }catch(error){
        throw error
    }
}

app.get("/books", async (req, res)=>{
    try{
        const allBooks = await allBook()
        if(allBooks.length !== 0){
            res.json({message: "New Book 📖 Added Successfully", allBooks : allBooks })
        }else{
            res.status(404).json({error: "No Books Found."})
        }
    }catch(error){
        res.status(500).json({error: "Failed to fetch data."})
    }
})

//API Cart GET.
//fetch product and add to the cart

async function allCartItems(){
    try{
        const cartItems = await Cart.find().populate("productId")
        console.log( "Cart Item:",cartItems)
        return cartItems
    }catch(error){
        console.log("All Cart Error:", error)
        throw error
    }
}

app.get("/books/cart", async (req, res)=>{
    try{
        const cartItems = await allCartItems()
        res.json({message: "Cart fetch successfully.", cartItems: cartItems})
    }catch(error){
        console.log(error)
        res.status(500).json({error: "Failed to fetch cart."})
    }
})



//Add categories
//add a new category to database
async function addCategory(newCategory){
    try{
        const category = new CategoryBook(newCategory)
        const saveCategory = await category.save()
        return saveCategory
    }catch(error){
        throw error
    }
}

app.post("/books/categories", async (req, res)=>{
    try{
        const saveCategory = await addCategory(req.body)
        res.status(200).json({message : "category added successfully", category: saveCategory})
    }catch(error){
        res.status(500).json({error: "Failed to add Category."})
    }
})

//Get All Categories
//fetch all categories for dislaying category cards

async function allCategories(){
    try{
        const categories = await CategoryBook.find()
        return categories
    }catch(error){
        throw error
    }
}

app.get("/books/categories", async (req, res)=>{
    try{
        const categories = await allCategories()
        res.json({message: "All categories books ", categories: categories})
    }catch(error){
        res.status(500).json({error: "Failed to fetch categories."})
    }
})

//Get Category By ID
//fetch all books belonging to selected category

async function booksByCategory(categoryNames){
    try{
        const books = await BookStore.find({categories : categoryNames})
        return books
    }catch(error){
        throw error
    }
}

app.get("/books/category/:categoryName", async (req, res)=>{
    try{
        const books = await booksByCategory(req.params.categoryName)
            res.json({message: "Category books found", books: books})
    }catch(error){
        res.status(500).json({error: "Failed to fetch category"})
    }
})


//POST books cart
//add a book to the cart. this or check cart and Increase Quantity create cart Item

async function addToCart(productId){
    try{
        const exisitingProduct = await Cart.findOne({
        productId: productId })
    if(exisitingProduct){
        const book = await BookStore.findById(productId)
        if(exisitingProduct.quantity >= book.stock){
            return{
                limitReached : true, cartItem: exisitingProduct
            }
        }
        exisitingProduct.quantity +=1

        const updatedCart = await exisitingProduct.save()
        return updatedCart
    } else{
        const cartItem = new Cart({
            productId: productId, quantity: 1
        })
        const savedCart = await cartItem.save()
        return savedCart
    }
    }catch(error){
        throw error
    }
}

app.post("/books/cart", async (req, res)=>{
    try{
        const {productId} = req.body
        const cartItem = await addToCart(productId)
        res.status(200).json({message: "Cart added successfully.", cartItem: cartItem})
    }catch(error){
        res.status(500).json({error: "Failed to add product cart"})
    }
})

//Decrease Cart Quantity
//decrease quantity of book already added to cart

async function decreaseCartQuantity(cartId){
    try{
        const cartItem = await Cart.findById(cartId)
        if(cartItem){
            if(cartItem.quantity === 1){
                await Cart.findByIdAndDelete(cartId)
                return { removed: true}
            }
            cartItem.quantity -=1
            const updateCart = await cartItem.save()
            return updateCart
        }
        
        return null
    }catch(error){
        throw error
    }
}

app.post("/books/cart/decrease/:cartId", async (req, res)=>{
    try{
        const updateCart = await decreaseCartQuantity(req.params.cartId)
        if(updateCart){
            res.json({message: "Cart quantity decrease successfully.", cartItem : updateCart})
        }else{
            res.status(404).json({error: "cart item not found."})
        }
    }catch(error){
        res.status(500).json({error: "Failed to decrease cart quantity."})
    }
})


//Delete Book from Cart "Remove from Book" 
//API removes specific product from the cart

async function removeFromCart(cartId){
    try{
        const deleteCart = await Cart.findByIdAndDelete(cartId)
        return deleteCart
    }catch(error){
        throw error
    }
}

app.delete("/books/cart/:cartId", async (req, res)=>{
    try{
        const deleteCart = await removeFromCart(req.params.cartId)
        if(deleteCart){
            res.json({ message: "Product removed from Cart", cartItem : deleteCart})
        }else{
            res.status(404).json({error: "Cart item not found"})
        }
    }catch(error){
        res.status(500).json({error: "Failed to remove product"})
    }
})

//add a book to the wishlist
// product Id wishlist collection check exisiting Item save wishlist Item

async function addToWishlist(productId){
    try{
        const exisitingProduct = await WishList.findOne({
            productId : productId
        })

        if(exisitingProduct){
            return exisitingProduct
        }

        const wishlistItems = new WishList({
            productId : productId
        })

        const savedWishlist = await wishlistItems.save()
    
        return savedWishlist
    }catch(error){
        throw error
    }
}

app.post("/books/wishlist", async (req, res)=>{
    try{
        const {productId} = req.body
        const wishlistItems = await addToWishlist(productId)
        
        res.status(200).json({message: "Wishlist fetched successfully", wishlistItems : wishlistItems})
        
    }catch(error){
        console.log(error)
        res.status(500).json({error: "Failed to add book to wishlist"})
    }
})

//get all wishlist items
async function allWishlistItems(){
    try{
        const wishlistItems = await WishList.find().populate("productId")
        return wishlistItems
    }catch(error){
        throw error
    }
}

app.get("/books/wishlist", async (req, res)=>{
    try{
        const wishlistItems = await allWishlistItems()
        res.status(200).json({message: "Wishlist fetched successfully", wishlistItems: wishlistItems})
    }catch(error){
        console.log(error)
        res.status(500).json({error : "Failed to fetch wishlist"})
    }
})

//Remove book from Wishlist
async function removeFromWishlist(wishlistId){
    try{
        const deleteWishlist = await WishList.findByIdAndDelete(wishlistId)
        return deleteWishlist
    }catch(error){
        throw error
    }
}

app.delete("/books/wishlist/:wishlistId", async (req, res)=>{
    try{
        const deleteWishlist = await removeFromWishlist(req.params.wishlistId)
        if(deleteWishlist){
            res.json({ message: "Book removed successfully.", wishlistItems: deleteWishlist})
        }else{
            res.status(404).json({error: "Wishlist item not found."})
        }
    }catch(error){
        res.status(500).json({error: "Wishlist book not Found."})
    }
})


//Get Book By ID "Detail Page"
//fetch one book using product Id 

async function bookById(bookId){
    try{
        const book = await BookStore.findById(bookId)
        return book
    }catch(error){
        throw error
    }
}

app.get("/books/:productId", async (req, res)=>{
    try{
        const book = await bookById(req.params.productId)
        if(book){
            res.json({message: "Book Found successfully.", book: book})
        }else{
            res.status(404).json({error: "Book not found..."})
        }
    }catch(error){
        res.status(500).json({ error : "Failed to fetch book."})
    }
})

//address create 
async function addAddress(addressData){
    const newAddress = new Address(addressData)
    return await newAddress.save()
}

app.post("/addresses", async (req, res)=>{
    try{
        const newAddress = await addAddress(req.body)
        res.status(201).json({message: "Address added successfully.", address: newAddress})
    }catch(error){
        res.status(500).json({error: "Failed to add address."})
    }
})

//get address

async function allAddresses(){
    try{
        const addresses = await Address.find()
        return addresses
    }catch(error){
        throw error
    }
}

app.get("/addresses", async (req, res)=> {
    try{
        const addresses = await allAddresses()
        res.status(200).json({message: "Address fetch successfully.", addresses: addresses})
    }catch(error){
        res.status(500).json({error: "Failed to fetch addresses."})
    }
})

//update function

async function updateAddress(addressId, addressData){
    try{
        const updateAddress = await Address.findByIdAndUpdate(addressId, addressData, {new: true})
        return updateAddress
    }catch(error){
        throw error
    }
}

app.put("/addresses/:addressId", async (req, res)=>{
    try{
        const updatedAddress = await updateAddress(req.params.addressId, req.body)
        if(updatedAddress){
            res.status(200).json({message: "Address updated successfully.", address: updatedAddress})
        }else{
            res.status(404).json({error: "Address not found."})
        }
    }catch(error){
        res.status(500).json({error: "Failed to update address"})
    }
})

// Delete Function
async function deleteAddress(addressId){
    try{
        const deletedAddress = await Address.findByIdAndDelete(addressId)
        return deletedAddress
    }catch(error){
        throw error
    }
}

app.delete("/addresses/:addressId", async (req, res)=>{
    try{
        const deletedAddress = await deleteAddress(req.params.addressId)
        if(deletedAddress){
            res.status(200).json({message: "Address deleted successfully.", address: deletedAddress})
        }else{
        res.status(404).json({error: "Address not found."})
    }
    }catch(error){
        res.status(500).json({error: "Failed to delete address."})
    }
})

//POst /order new order 
app.post("/orders", async (req, res)=>{
    try{
        const newOrder = new Order(req.body)
        const saveOrder = await newOrder.save()
        res.status(201).json({message: "Order placed successfully.", order: saveOrder})
    }catch(error){
        console.log(error)
        res.status(500).json({error: "Failed to place order"})
    }
})

//Get order get all orders

app.get("/orders", async (req, res)=>{
    try{
        const orders = await Order.find().sort({orderDate: -1}) //latest order phale aaye ga
        res.status(200).json({message: "Orders fetched successfully", orders: orders})
    }catch(error){
        console.log(error)
        res.status(500).json({error: "Failed to fetch orders"})
    }
})

//delete orders
app.delete("/orders/:orderId", async (req, res)=>{
    try{
        const deleteOrder = await Order.findByIdAndDelete(req.params.orderId)
        if(deleteOrder){
            res.status(200).json({message: "order Deleted successfully.", 
                order: deleteOrder})
        }else{
            res.status(404).json({error: "order not found."})
        }
        
    }catch(error){
        console.log(error)
        res.status(500).json({error: "Failed to clear order..."})
    }
})

const PORT = 2000
app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})
