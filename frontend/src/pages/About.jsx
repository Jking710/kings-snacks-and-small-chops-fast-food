import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faStar, faTrophy, faHeart } from "@fortawesome/free-solid-svg-icons";
import { Users, Clock, MapPin, Award, ChefHat, Truck } from "lucide-react";

const stats = [
  { icon: <Users className="w-7 h-7" />, value: "50,000+", label: "Happy Customers" },
  { icon: <Clock className="w-7 h-7" />, value: "8 Years", label: "Of Excellence" },
  { icon: <ChefHat className="w-7 h-7" />, value: "120+", label: "Menu Items" },
  { icon: <Truck className="w-7 h-7" />, value: "30 Mins", label: "Avg. Delivery" },
];

const team = [
  {
    name: "Chef Johnny King",
    role: "Head Chef & Co-Founder",
    // Black male chef cooking in restaurant kitchen — redcharlie (@redcharlie)
    img: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=400&h=400&fit=crop&auto=format&q=80",
    bio: "With 15 years of culinary experience across Lagos and London, Johnny crafts every recipe with passion and precision.",
  },
  {
    name: "Shù lín",
    role: "Operations Manager",
    // Full-face close-up portrait of smiling Black woman — Ayo Ogunseinde (@armedshutter)
    img: "https://images.unsplash.com/photo-1569925444984-9e2e5fc3d1fb?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    bio: "Shù ensures every order reaches you hot, fresh, and on time. She's the engine that keeps Kings Chops running.",
  },
  {
    name: "Tunde Bakare",
    role: "Pastry & Desserts Chef",
    // Confident smiling Nigerian man portrait — Prince Akachi (@princearkman), Lagos
    img: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop&auto=format&q=80",
    bio: "Tunde's cakes, donuts, and pancakes have won hearts across Lagos. His creations are a signature of Kings Chops.",
  },
];

const milestones = [
  { year: "2016", event: "Kings Chops founded in Ikeja, Lagos with just 5 menu items." },
  { year: "2018", event: "Expanded to online ordering, serving 500+ customers weekly." },
  { year: "2020", event: "Launched our mobile app with 10,000+ downloads in 3 months." },
  { year: "2022", event: "Won the Lagos Food Excellence Award for Best Fast Food Brand." },
  { year: "2024", event: "Reached 50,000 loyal customers and launched same-day delivery citywide." },
];

// Portrait image with shimmer skeleton
function TeamImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-orange-100 shadow-md mb-4">
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-linear-to-br from-orange-100 via-orange-50 to-yellow-100" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-50 text-4xl">
          👤
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover object-top transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

function About() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-yellow-600 via-orange-500 to-rose-700 text-white py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full" />
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-black opacity-5 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white opacity-5 rounded-full" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faCrown} className="text-yellow-300 text-4xl" />
            <h1 className="font-['Georgia'] text-5xl font-bold">Kings <span className="text-yellow-300">Chops</span></h1>
          </div>
          <p className="text-xl mt-4 text-orange-100 font-['Georgia'] italic">
            "Where Every Bite Tells a Story"
          </p>
          <p className="mt-6 text-orange-50 text-base lg:text-lg leading-relaxed">
            Born from a love of food and community, Kings Chops has been feeding Lagos with flavour, 
            warmth, and world-class snacks since 2016.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-orange-50 py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center bg-white rounded-2xl py-8 px-4 shadow-sm border border-orange-100 hover:shadow-orange-200 hover:shadow-md transition-all">
              <div className="flex justify-center text-orange-500 mb-3">{s.icon}</div>
              <p className="text-3xl font-bold text-gray-800 font-['Georgia']">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Our Story</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2 font-['Georgia']">
              From a Kitchen Dream to <span className="text-orange-600">Lagos' Favourite</span>
            </h2>
            <p className="text-gray-600 mt-4 leading-relaxed">
              Kings Chops started in a small kitchen in Ikeja, Lagos, where our founder Johnny King had a simple vision: 
              to serve restaurant-quality snacks to everyday people at affordable prices. What started as a weekend 
              side business quickly grew into a full-scale restaurant and delivery operation that has touched the hearts 
              (and taste buds) of over 50,000 Lagosians.
            </p>
            <p className="text-gray-600 mt-3 leading-relaxed">
              We source the freshest ingredients daily, cook everything in-house, and deliver with care. Whether it's 
              a late-night pizza craving or a party platter of small chops, Kings Chops is always ready to serve you.
            </p>
            <div className="flex gap-3 mt-6">
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                <FontAwesomeIcon icon={faHeart} className="text-rose-500" />
                <span className="text-sm font-medium text-gray-700">Made with Love</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Award Winning</span>
              </div>
            </div>
          </div>
          <div className="bg-linear-to-br from-orange-100 to-yellow-100 rounded-3xl p-10 text-center">
            <FontAwesomeIcon icon={faCrown} className="text-yellow-600 text-6xl mb-4" />
            <blockquote className="font-['Georgia'] text-xl italic text-gray-700 leading-relaxed">
              "Food is not just fuel — it's culture, comfort, and connection. We built Kings Chops to bring 
              all three to your doorstep."
            </blockquote>
            <p className="mt-4 font-semibold text-orange-600">— Chef Johnny King, Founder</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-orange-500 font-['Georgia'] mb-12">Our Journey</h2>
          <div className="relative border-l-2 border-orange-500 ml-6 lg:ml-0 lg:border-l-0">
            {milestones.map((m, i) => (
              <div key={i} className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} lg:justify-between`}>
                <div className="bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-sm font-['Georgia'] whitespace-nowrap min-w-20 text-center">
                  {m.year}
                </div>
                <div className="flex-1 bg-white rounded-xl p-4 shadow-sm max-w-md">
                  <p className="text-gray-700 text-sm leading-relaxed">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team — real portrait photos */}
      <div className="py-16 px-6 bg-orange-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 font-['Georgia'] mb-2">
            Meet the <span className="text-orange-600">Team</span>
          </h2>
          <p className="text-center text-gray-500 mb-10">The people behind every delicious bite</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl pt-8 pb-6 px-6 text-center shadow-sm border border-orange-100 hover:shadow-orange-200 hover:shadow-md transition-all flex flex-col justify-between h-full"
              >
                <div>
                  {/* Real portrait photo in circular frame */}
                  <TeamImage src={member.img} alt={member.name} />
                  <h3 className="font-bold text-lg text-gray-800 font-['Georgia']">{member.name}</h3>
                  <p className="text-orange-500 text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                </div>
                <div className="flex justify-center mt-6 gap-1">
                  {[...Array(5)].map((_, j) => (
                    <FontAwesomeIcon key={j} icon={faStar} className="text-yellow-400 text-xs" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-linear-to-r from-orange-600 to-rose-600 py-16 px-6 text-center text-white">
        <Award className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
        <h2 className="text-3xl font-bold font-['Georgia'] mb-2">Ready to Taste the Difference?</h2>
        <p className="text-orange-100 mb-8 max-w-xl mx-auto">
          Join over 50,000 happy customers who trust Kings Chops for their snack cravings. Order now and experience why we're Lagos' favourite.
        </p>
        <a href="/menu" className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-all hover:scale-105">
          Explore Our Menu
        </a>
      </div>
    </div>
  );
}

export default About;
