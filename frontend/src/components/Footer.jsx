import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import facebook from "../assets/facebook.svg";
import instagram from "../assets/instagram.svg";
import thread from "../assets/thread.svg";
import twitter from "../assets/twitter.svg";

function Footer() {
  return (
    <footer className="bg-[#f3ebe5] text-[#3b2418] selection:bg-[#7a4a2d] selection:text-white">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#6b4226]">
              Quick Links
            </h3>

            <ul className="space-y-2 text-gray-700">
              <li className="hover:text-[#6b4226] transition-colors cursor-pointer">
                Home
              </li>

              <li className="hover:text-[#6b4226] transition-colors cursor-pointer">
                Menu
              </li>

              <li className="hover:text-[#6b4226] transition-colors cursor-pointer">
                About Us
              </li>

              <li className="hover:text-[#6b4226] transition-colors cursor-pointer">
                Contact
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#6b4226]">
              Contact Us
            </h3>

            <div className="flex gap-2 items-start mb-3">
              <MapPin className="text-[#6b4226] shrink-0" />

              <div className="text-gray-700">
                <p>No.1 Plasma District</p>
                <p>Ikeja, Lagos</p>
              </div>
            </div>

            <div className="flex gap-2 items-center mb-3">
              <Phone className="text-[#6b4226] shrink-0" />

              <p className="text-gray-700">
                Phone: (+234) 90-2552-6780
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <Mail className="text-[#6b4226] shrink-0" />

              <p className="text-gray-700">
                Email: kingschops247@gmail.com
              </p>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold text-[#6b4226] mb-4">
              Opening Hours
            </h3>

            <p className="text-gray-700">
              Monday - Friday: 7am - 11pm
            </p>

            <p className="text-gray-700">
              Saturday - Sunday: 10am - 11pm
            </p>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#6b4226]">
              Follow Us
            </h3>

            <div className="flex space-x-2">

              <img
                src={facebook}
                alt="Facebook"
                className="h-6 w-8 hover:bg-[#7a4a2d] hover:rounded-xs cursor-pointer hover:scale-125 transition-all"
              />

              <img
                src={instagram}
                alt="Instagram"
                className="h-6 w-8 hover:bg-[#7a4a2d] hover:rounded-xs cursor-pointer hover:scale-125 transition-all"
              />

              <img
                src={thread}
                alt="Thread"
                className="h-6 w-8 hover:bg-[#7a4a2d] hover:rounded-xs cursor-pointer hover:scale-125 transition-all"
              />

              <img
                src={twitter}
                alt="Twitter"
                className="h-6 w-8 hover:bg-[#7a4a2d] hover:rounded-xs cursor-pointer hover:scale-125 transition-all"
              />

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-8 border-t border-[#d8c4b4] pt-8 pb-8 text-center">

        <p className="text-gray-700">
          &copy; {new Date().getFullYear()} Kings{" "}
          <span className="font-semibold text-[#6b4226]">
            Chops
          </span>
          . All rights reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;