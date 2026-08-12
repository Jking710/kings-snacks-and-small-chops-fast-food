import React from "react";
import snacks from "../assets/hero.jpg";
import playstore from "../assets/playstore.png";
import appstore from "../assets/appstore.png";
import pizza from "../assets/pizza.webp";
import alarm from "../assets/alarmclock.png";
import discount from "../assets/discount.gif";
import cs from "../assets/CS.png";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="bg-yellow-600 h-[600px] selection:transparent selection:text-current">
      <div className="flex lg:flex-row flex-col items-center justify-center p-10 lg:max-w-7xl mx-auto relative">
        <div className="lg:w-1/2 lg:space-y-6 lg:px-10 relative font-[Georgia] z-10">
          <div className="flex gap-0 lg:gap-4">
            <img src={playstore} alt="playstore" className="w-30 h-15.5 mt-1 cursor-pointer" />
            <img src={appstore} alt="appstore" className="w-28 h-10.5 mt-3.5 cursor-pointer" />
          </div>
          <h1 className="text-4xl font-bold lg:text-6xl text-white">
            Here we <span className="text-black">serve </span>and deliver the{" "}
            <span className="text-rose-900">best snacks</span> and{" "}
            <span className="text-orange-600">small chops.</span>
          </h1>
          <p className="my-3 mb-7">
            Delight your taste buds with some of the world best culinary delights. Place your
            orders, sit down and relax as we deliver your tasty snacks and drinks to your doorstep
            at lightning speed 😁.
          </p>
          <div className="flex gap-5 lg:gap-10">
            <Link
              to="/login"
              className="text-white bg-black rounded-lg px-3 py-2 cursor-pointer hover:bg-orange-600 hover:scale-110 transition-all"
            >
              Place Your Orders
            </Link>
            <Link
              to="/contact"
              className="border-white hover:bg-orange-600 hover:text-white hover:border-none border-2 px-5 py-2 rounded-lg cursor-pointer hover:scale-110 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 w-[400px] relative">
          <img src={pizza} className="rounded-full mx-auto spin" alt="Food" />
          <div className="hidden lg:flex bg-orange-600 gap-2 text-lg border-red-200 border items-center absolute px-4 py-2 rounded-full lg:bottom-9 lg:right-13.5">
            <img src={alarm} alt="clock" className="w-12 h-10 lg:h-12" />
            <p className="leading-4 text-sm font-semibold text-white">Super Fast <br />Delivery</p>
          </div>
          <div className="hidden lg:flex bg-orange-600 gap-2 text-lg border-red-200 border items-center absolute px-4 py-2 rounded-full lg:bottom-79 lg:right-15">
            <img src={discount} alt="clock" className="w-12 h-10 lg:h-12" />
            <p className="leading-4 text-sm font-semibold text-white">5% Discount <br />on all order</p>
          </div>
          <div className="hidden lg:flex bg-orange-600 gap-2 text-lg border-red-200 border items-center absolute px-4 py-2 rounded-full lg:bottom-80 lg:right-91">
            <img src={cs} alt="clock" className="w-12 h-10 lg:h-12" />
            <p className="leading-4 text-sm font-semibold text-white">24/7 Active <br />Customer Service</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
