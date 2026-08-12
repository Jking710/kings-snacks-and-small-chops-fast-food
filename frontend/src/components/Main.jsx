import React from "react";
import pepperoni from "../assets/pepperoni.jpg";
import hamburger from "../assets/hamburger.jpg";
import pancakes from "../assets/pancakes.jpg";
import shawarma from "../assets/shawarma.jpg";
import taco from "../assets/taco.jpg";
import burrito from "../assets/burrito.jpg";
import donut from "../assets/donut.jpg";
import cake from "../assets/cake.jpg";
import drink from "../assets/drink.jpg";
import Card from "./Card.jsx";

function Main() {
  const menu = [
    { id: 1, snacks: pepperoni, name: "Pizza", desc: "Pizza filled with tomatoes, pepper, cheese and lots of chicken, we offer other flavours of pizza as well", rating: 5 },
    { id: 2, snacks: hamburger, name: "Hamburger", desc: "Tasty Hamburger filled with lots of cheese, beef, cabbages and tasty tomatoes and vegies", rating: 5 },
    { id: 3, snacks: shawarma, name: "Shawarma", desc: "Juicy Shawarama filled with chicken, hot-dogs and sauce to give that satisfactory taste", rating: 5 },
    { id: 4, snacks: taco, name: "Taco", desc: "Enjoy italian served dish at your disposal giving you that crunchy sensation and lovely taste", rating: 5 },
    { id: 5, snacks: burrito, name: "Buritto", desc: "Enjoy this lovely snack, filled with beef, beans and lots of vegies mixed together with the sauce", rating: 5 },
    { id: 6, snacks: donut, name: "Donut", desc: "Crunchy donut filled with lots of sprinkles and toppings of your choice", rating: 5 },
    { id: 7, snacks: cake, name: "Cake", desc: "We serve cakes, in different flavours such as vanilla, chocolate or mixtures", rating: 5 },
    { id: 8, snacks: pancakes, name: "Pancake", desc: "Tasty pancake here to give your tasty buds that sweet sensation and to brighten your day", rating: 5 },
    { id: 9, snacks: drink, name: "Drinks", desc: "We serve all kind of soft drinks here such as fanta, coca-cola, pepsi and other carbonated drinks", rating: 5 },
  ];

  return (
    <div className="py-15 px-5 lg:px-0 lg:py-20 bg-gray-800">
      <div className="text-center max-w-7xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-orange-600 pb-4">
          Popular Snacks & Small Chops
        </h1>
        <p className="text-[13px] lg:text-xl text-white pl-2">
          Check out some of our most popular snacks and small chops that we serve
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 pt-11 gap-7">
          {menu.map((item) => (
            <Card key={item.id} menu={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Main;
