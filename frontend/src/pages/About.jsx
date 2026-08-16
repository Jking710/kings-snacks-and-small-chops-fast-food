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
    img: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=400&h=400&fit=crop&auto=format&q=80",
    bio: "With 15 years of culinary experience across Lagos and London, Johnny crafts every recipe with passion and precision.",
  },
  {
    name: "Shù lín",
    role: "Operations Manager",
    img: "https://images.unsplash.com/photo-1569925444984-9e2e5fc3d1fb?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    bio: "Shù ensures every order reaches you hot, fresh, and on time. She's the engine that keeps Kings Chops running.",
  },
  {
    name: "Tunde Bakare",
    role: "Pastry & Desserts Chef",
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
        <div className="absolute inset-0 animate-pulse bg-linear-to-br from-[#f3e2d6] via-[#fff7f2] to-[#ead0bf]" />
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
      <div className="bg-linear-to-br from-[#2b2118] via-[#6f3d29] to-[#c45b2c] text-white py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full" />
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-black opacity-5 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white opacity-5 rounded-full" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faCrown} className="text-[#f5c76b] text-4xl" />

            <h1 className="font-['Georgia'] text-5xl font-bold">
              Kings <span className="text-[#f5c76b]">Chops</span>
            </h1>
          </div>

          <p className="text-xl mt-4 text-[#f3d8c6] font-['Georgia'] italic">
            "Where Every Bite Tells a Story"
          </p>

          <p className="mt-6 text-[#f8e9df] text-base lg:text-lg leading-relaxed">
            Born from a love of food and community, Kings Chops has been feeding Lagos with flavour,
            warmth, and world-class snacks since 2016.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#faf4ef] py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className="text-center bg-white rounded-2xl py-8 px-4 shadow-sm border border-[#ead8cc] hover:shadow-orange-200 hover:shadow-md transition-all"
            >
              <div className="flex justify-center text-[#a94d2b] mb-3">
                {s.icon}
              </div>

              <p className="text-3xl font-bold text-gray-800 font-['Georgia']">
                {s.value}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div>
            <span className="text-[#a94d2b] font-semibold text-sm uppercase tracking-widest">
              Our Story
            </span>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2 font-['Georgia']">
              From a Kitchen Dream to{" "}
              <span className="text-[#a94d2b]">Lagos' Favourite</span>
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
              <div className="flex items-center gap-2 bg-[#faf0e9] px-4 py-2 rounded-full border border-[#ead0c1]">
                <FontAwesomeIcon icon={faHeart} className="text-[#c45b2c]" />
                <span className="text-sm font-medium text-gray-700">
                  Made with Love
                </span>
              </div>

              <div className="flex items-center gap-2 bg-[#faf0e9] px-4 py-2 rounded-full border border-[#ead0c1]">
                <FontAwesomeIcon icon={faTrophy} className="text-[#c49332]" />
                <span className="text-sm font-medium text-gray-700">
                  Award Winning
                </span>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-[#f3e2d6] via-[#f8e9df] to-[#e8c9b7] rounded-3xl p-10 text-center">
            <FontAwesomeIcon
              icon={faCrown}
              className="text-[#b9782d] text-6xl mb-4"
            />

            <blockquote className="font-['Georgia'] text-xl italic text-gray-700 leading-relaxed">
              "Food is not just fuel — it's culture, comfort, and connection. We built Kings Chops to bring
              all three to your doorstep."
            </blockquote>

            <p className="mt-4 font-semibold text-[#a94d2b]">
              — Chef Johnny King, Founder
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-linear-to-br from-[#241b16] via-[#3d2920] to-[#6f3d29] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#e8a66f] font-['Georgia'] mb-12">
            Our Journey
          </h2>

          <div className="relative border-l-2 border-[#b85b32] ml-6 lg:ml-0 lg:border-l-0">
            {milestones.map((m, i) => (
              <div
                key={i}
                className={`relative flex items-start gap-6 mb-8 ${
                  i % 2 === 0
                    ? "lg:flex-row"
                    : "lg:flex-row-reverse"
                } lg:justify-between`}
              >
                <div className="bg-[#a94d2b] text-white font-bold px-4 py-2 rounded-xl text-sm font-['Georgia'] whitespace-nowrap min-w-20 text-center">
                  {m.year}
                </div>

                <div className="flex-1 bg-white rounded-xl p-4 shadow-sm max-w-md">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {m.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-16 px-6 bg-[#faf4ef]">
        <div className="max-w-5xl mx-auto">

          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 font-['Georgia'] mb-2">
            Meet the <span className="text-[#a94d2b]">Team</span>
          </h2>

          <p className="text-center text-gray-500 mb-10">
            The people behind every delicious bite
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl pt-8 pb-6 px-6 text-center shadow-sm border border-[#ead8cc] hover:shadow-orange-200 hover:shadow-md transition-all flex flex-col justify-between h-full"
              >
                <div>
                  <TeamImage src={member.img} alt={member.name} />

                  <h3 className="font-bold text-lg text-gray-800 font-['Georgia']">
                    {member.name}
                  </h3>

                  <p className="text-[#b85b32] text-sm font-medium mb-3">
                    {member.role}
                  </p>

                  <p className="text-gray-500 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                <div className="flex justify-center mt-6 gap-1">
                  {[...Array(5)].map((_, j) => (
                    <FontAwesomeIcon
                      key={j}
                      icon={faStar}
                      className="text-[#d4a83b] text-xs"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-linear-to-r from-[#8b3e24] via-[#a94d2b] to-[#c45b2c] py-16 px-6 text-center text-white">
        <Award className="w-12 h-12 mx-auto mb-4 text-[#f5c76b]" />

        <h2 className="text-3xl font-bold font-['Georgia'] mb-2">
          Ready to Taste the Difference?
        </h2>

        <p className="text-[#f8dfd0] mb-8 max-w-xl mx-auto">
          Join over 50,000 happy customers who trust Kings Chops for their snack cravings. Order now and experience why we're Lagos' favourite.
        </p>

        <a
          href="/menu"
          className="inline-block bg-white text-[#a94d2b] font-bold px-8 py-3 rounded-xl hover:bg-[#fff3eb] transition-all hover:scale-105"
        >
          Explore Our Menu
        </a>
      </div>
    </div>
  );
}

export default About;