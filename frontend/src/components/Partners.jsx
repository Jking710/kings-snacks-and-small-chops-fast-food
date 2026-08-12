import React from "react";
import burger from "../assets/partners/burgerking.png";
import coca from "../assets/partners/coca.png";
import denny from "../assets/partners/denny.png";
import domino from "../assets/partners/domino.png";
import dq from "../assets/partners/dq.png";
import dunkin from "../assets/partners/dunkin.jpeg";
import fanta from "../assets/partners/fanta.jpeg";
import kfc from "../assets/partners/kfc.png";
import mcdonalds from "../assets/partners/mcdonalds.webp";
import pepsi from "../assets/partners/pepsi.png";

function Partners() {
  return (
    <div className="px-4  lg:px-0 py-10 bg-white">
      <div className="text-center">
        <h1 className=" text-3xl lg:text-4xl font-bold mb-4 text-orange-600">
          Our Partners
        </h1>
        <p className=" text-[13px] lg:text-xl  ">
          This are our partners across the world who is in partnership with us to provide adequate services to you anywhere in the
          world
        </p>
        <div
          style={{
            maskTmage:
              "linear-gradient(to right, hsl(0 0% 0% /0), hsl(0 0% 0% /1) 10%, hsl(0 0% 0% /1) 90%, hsl(0 0% 0% /0))",
            webkitMaskImage:
              "linear-gradient(to right, hsl(0 0% 0% /0), hsl(0 0% 0% /1) 10%, hsl(0 0% 0% /1) 9%, hsl(0 0% 0% /0))",
          }}
          className="max-w-6xl mx-auto mt-10 py-2 flex gap-4 flex-nowrap overflow-hidden"
        >
          <div className="flex gap-4 loop-scroll ">
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={burger} alt="" className="h-30 w-full" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={coca} alt="" className="h-30 w-full" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={denny} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={domino} alt="" className="h-30 w-full" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={dq} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={dunkin} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={fanta} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={kfc} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={mcdonalds} alt="" className="h-30 w-full" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={pepsi} alt="" className="h-30" />
            </div>
          </div>

          <div className="flex gap-4 loop-scroll ">
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={burger} alt="" className="h-30 w-full" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={coca} alt="" className="h-30 w-full" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={denny} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={domino} alt="" className="h-30 w-full" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={dq} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={dunkin} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={fanta} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={kfc} alt="" className="h-30" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={mcdonalds} alt="" className="h-30 w-full" />
            </div>
            <div className="shadow-orange-200 shadow-md p-4 w-60 bg-white">
              <img src={pepsi} alt="" className="h-30" />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Partners;
