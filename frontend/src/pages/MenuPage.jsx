import React, { useState } from "react";
import { ShoppingCart, Search, Star, Plus, Check } from "lucide-react";
import { useCart } from "../useCart.js";
import { Link } from "react-router-dom";

import meatPieImg from "../assets/meat_pie.jpeg";
import springRollsImg from "../assets/spring_rolls.jpeg";
import puffPuffImg from "../assets/puff_puff.jpeg";
import zoboImg from "../assets/zobo_drink.jpeg";
import fishRollsImg from "../assets/fish_rolls.jpeg";

const menuItems = [
  // Pizzas
  {
    id: 1,
    name: "Pepperoni Pizza",
    category: "Pizza",
    price: 4500,
    rating: 5,
    img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop&auto=format",
    desc: "Classic pepperoni with mozzarella cheese and rich tomato sauce on a crispy crust.",
    tag: "Best Seller",
  },
  {
    id: 2,
    name: "BBQ Chicken Pizza",
    category: "Pizza",
    price: 4800,
    rating: 5,
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format",
    desc: "Smoky BBQ sauce, tender chicken chunks, red onions and melted cheddar.",
    tag: "Popular",
  },
  {
    id: 3,
    name: "Veggie Supreme Pizza",
    category: "Pizza",
    price: 3800,
    rating: 4,
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&auto=format",
    desc: "Loaded with bell peppers, mushrooms, olives, onions and fresh tomatoes.",
    tag: null,
  },
  // Burgers
  {
    id: 4,
    name: "Classic Hamburger",
    category: "Burgers",
    price: 3200,
    rating: 5,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format",
    desc: "Juicy beef patty, fresh lettuce, tomatoes, cheese and our signature sauce.",
    tag: "Best Seller",
  },
  {
    id: 5,
    name: "Double Smash Burger",
    category: "Burgers",
    price: 4200,
    rating: 5,
    img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop&auto=format",
    desc: "Two smashed beef patties, American cheese, pickles, caramelised onions.",
    tag: "Popular",
  },
  {
    id: 6,
    name: "Chicken Burger",
    category: "Burgers",
    price: 3000,
    rating: 4,
    img: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop&auto=format",
    desc: "Crispy fried chicken fillet, coleslaw and honey-mustard mayo in a brioche bun.",
    tag: null,
  },
  // Shawarma & Wraps
  {
    id: 7,
    name: "Chicken Shawarma",
    category: "Shawarma",
    price: 2800,
    rating: 5,
    img: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop&auto=format",
    desc: "Marinated chicken, garlic sauce, pickled veggies and fresh herbs in warm flatbread.",
    tag: "Best Seller",
  },
  {
    id: 8,
    name: "Beef Shawarma",
    category: "Shawarma",
    price: 3200,
    rating: 5,
    img: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&h=300&fit=crop&auto=format",
    desc: "Seasoned beef strips, tahini, tomatoes and crunchy cabbage wrapped tight.",
    tag: null,
  },
  {
    id: 9,
    name: "Taco",
    category: "Shawarma",
    price: 2500,
    rating: 4,
    img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop&auto=format",
    desc: "Crunchy taco shell stuffed with spiced beef, cheese, salsa and sour cream.",
    tag: null,
  },
  {
    id: 10,
    name: "Burrito",
    category: "Shawarma",
    price: 3000,
    rating: 4,
    img: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop&auto=format",
    desc: "Large flour tortilla packed with rice, beans, beef, guacamole and salsa.",
    tag: "Popular",
  },
  // Small Chops
  {
    id: 11,
    name: "Spring Rolls (6pcs)",
    category: "Small Chops",
    price: 1800,
    rating: 5,
    img: springRollsImg, // ✅ Your photo — thick golden-brown stacked spring rolls
    desc: "Golden crispy spring rolls filled with seasoned vegetables and minced meat.",
    tag: "Popular",
  },
  {
    id: 12,
    name: "Samosa (6pcs)",
    category: "Small Chops",
    price: 1500,
    rating: 5,
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&auto=format",
    desc: "Flaky pastry triangles stuffed with spiced potatoes and minced beef.",
    tag: null,
  },
  {
    id: 13,
    name: "Puff Puff (10pcs)",
    category: "Small Chops",
    price: 1200,
    rating: 5,
    img: puffPuffImg, // ✅ Your photo — pile of round golden-brown fried dough balls
    desc: "Soft, pillowy Nigerian fried dough — lightly sweet and completely irresistible.",
    tag: "Best Seller",
  },
  {
    id: 14,
    name: "Peppered Chicken Wings",
    category: "Small Chops",
    price: 3500,
    rating: 5,
    img: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop&auto=format",
    desc: "Juicy chicken wings coated in our fiery pepper sauce. Served with dip.",
    tag: "Spicy 🌶️",
  },
  {
    id: 15,
    name: "Fish Rolls (4pcs)",
    category: "Small Chops",
    price: 1600,
    rating: 4,
    img: fishRollsImg, // ✅ Your photo — long golden-brown fried Nigerian fish rolls on a plate
    desc: "Crispy pastry rolls filled with seasoned fish and onions.",
    tag: null,
  },
  // Pastries & Sweets
  {
    id: 16,
    name: "Glazed Donut",
    category: "Pastries",
    price: 800,
    rating: 5,
    img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop&auto=format",
    desc: "Classic glazed donut — light, fluffy, and covered in a sweet vanilla glaze.",
    tag: null,
  },
  {
    id: 17,
    name: "Chocolate Cake Slice",
    category: "Pastries",
    price: 1500,
    rating: 5,
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format",
    desc: "Rich moist chocolate cake with ganache frosting. A must-try for chocoholics.",
    tag: "Popular",
  },
  {
    id: 18,
    name: "Pancake Stack",
    category: "Pastries",
    price: 1800,
    rating: 4,
    img: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop&auto=format",
    desc: "Three fluffy pancakes served with maple syrup, butter and fresh berries.",
    tag: null,
  },
  {
    id: 19,
    name: "Meat Pie",
    category: "Pastries",
    price: 600,
    rating: 5,
    img: meatPieImg, // ✅ Your photo — golden half-moon pastry with crimped fork edges
    desc: "Buttery pastry shell filled with minced beef, diced potatoes and carrots. Baked to a perfect golden brown.",
    tag: "Best Seller",
  },
  {
    id: 20,
    name: "Cupcake",
    category: "Pastries",
    price: 900,
    rating: 5,
    img: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop&auto=format",
    desc: "Moist, fluffy cupcakes topped with swirled buttercream frosting. Available in vanilla, red velvet, chocolate fudge, strawberry, and lemon zest flavours.",
    tag: "Popular",
  },
  // Drinks
  {
    id: 21,
    name: "Coca-Cola (50cl)",
    category: "Drinks",
    price: 400,
    rating: 5,
    img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop&auto=format",
    desc: "Ice-cold Coca-Cola to complement your meal perfectly.",
    tag: null,
  },
  {
    id: 22,
    name: "Fresh Zobo Drink",
    category: "Drinks",
    price: 600,
    rating: 5,
    img: zoboImg, // ✅ Your photo — deep red hibiscus zobo in a glass with dried petals
    desc: "Chilled hibiscus drink infused with ginger and a hint of citrus.",
    tag: "Nigerian Fave",
  },
  {
    id: 23,
    name: "Bottled Water",
    category: "Drinks",
    price: 200,
    rating: 5,
    img: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop&auto=format",
    desc: "Pure chilled table water — always essential.",
    tag: null,
  },
  {
    id: 24,
    name: "Chapman Cocktail",
    category: "Drinks",
    price: 1200,
    rating: 5,
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop&auto=format",
    desc: "Nigeria's favourite party drink — a fruity, refreshing non-alcoholic cocktail.",
    tag: "Popular",
  },
];

const categories = [
  "All",
  "Pizza",
  "Burgers",
  "Shawarma",
  "Small Chops",
  "Pastries",
  "Drinks",
];

function FoodImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-48 overflow-hidden bg-orange-50">
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-linear-to-r from-orange-100 via-white to-orange-100" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-50 text-5xl">
          🍽️
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [addedIds, setAddedIds] = useState({});
  const { addToCart, totalItems } = useCart();

  const filtered = menuItems.filter((item) => {
    const matchCat =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (item) => {
    addToCart(item);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(
      () => setAddedIds((prev) => ({ ...prev, [item.id]: false })),
      1500,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-linear-to-r from-yellow-600 to-orange-600 text-white py-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-5 left-10 text-white opacity-10 text-8xl">
            🍕
          </div>
          <div className="absolute bottom-5 right-10 text-white opacity-10 text-7xl">
            🍔
          </div>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold font-['Georgia'] relative">
          Our <span className="text-yellow-200">Menu</span>
        </h1>
        <p className="mt-2 text-orange-100 text-lg relative">
          Over 24 delicious items — something for everyone
        </p>
        <Link
          to="/cart"
          className="absolute top-5 right-5 lg:top-8 lg:right-8 flex items-center gap-2 bg-white text-orange-600 font-bold px-4 py-2 rounded-xl hover:bg-orange-50 transition-all hover:scale-105"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          {totalItems > 0 && (
            <span className="bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-gray-500 text-lg">
              No items found. Try a different search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-orange-100 hover:shadow-orange-200 hover:shadow-md transition-all overflow-hidden group flex flex-col h-full"
              >
                <FoodImage src={item.img} alt={item.name} />
                <div className="p-4 flex flex-col flex-1">
                  <div>
                    {item.tag && (
                      <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                        {item.tag}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-800 text-base font-['Georgia']">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                    <div className="flex mt-2 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-orange-100">
                    <span className="text-orange-600 font-bold text-lg">
                      ₦{item.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleAdd(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        addedIds[item.id]
                          ? "bg-green-500 text-white"
                          : "bg-orange-600 text-white hover:bg-orange-700 hover:scale-105"
                      }`}
                    >
                      {addedIds[item.id] ? (
                        <>
                          <Check className="w-4 h-4" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPage;
