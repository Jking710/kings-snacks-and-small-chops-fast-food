import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import facebook from "../assets/facebook.svg";
import instagram from "../assets/instagram.svg";
import thread from "../assets/thread.svg";
import twitter from "../assets/twitter.svg";


function Footer() {
  return (
    <footer className="bg-orange-50 selection:bg-rose-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-500">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>Home</li>
              <li>Menu</li>
              <li>About Us</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-500">
              Contact Us
            </h3>
            <div className="flex gap-2 mb-2">
              <MapPin className="text-orange-500" />
              <div>
                <p>No.1 Plasma District</p>
                <p> Ikeja, Lagos</p>
              </div>
            </div>

            <div className="flex gap-2 tems-center mb-2">
              <Phone className="text-orange-500" />
              <p>Phone: (+234) 90-2552-6780 </p>
            </div>

            <div className="flex gap-2">
              <Mail className="text-orange-500" />
              <p>Email: kingschops@gmail.com</p>
            </div>
          </div>
          <div>
            <div>
              <h3 className="text-lg font-semibold text-orange-500 mb-4">
                Opening Hours
              </h3>
              <p>Monday - Friday: 7am - 11pm</p>
              <p>Saturday - Sunday: 10am - 11pm</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-500">
              Follow Us
            </h3>
            <div className="flex space-x-2">
              <img
                src={facebook}
                alt="Facebook"
                className="h-6 w-8 hover:bg-orange-500 hover:rounded-xs cursor-pointer hover:scale-125 transition-all"
              />
              <img
                src={instagram}
                alt="Instagram"
                className="h-6 w-8 hover:bg-orange-500 hover:rounded-xs cursor-pointer hover:scale-125 transition-all"
              />
              <img
                src={thread}
                alt="Thread"
                className="h-6 w-8 hover:bg-orange-500 hover:rounded-xs cursor-pointer hover:scale-125 transition-all"
              />
              <img
                src={twitter}
                alt="Twitter"
                className="h-6 w-8 hover:bg-orange-500 hover:rounded-xs cursor-pointer hover:scale-125 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-muted-foreground/20 pt-8 pb-8 text-center">
        <p>
          &copy; {new Date().getFullYear()} Kings <span className="font-semibold text-yellow-600">Chops</span>. All right reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
