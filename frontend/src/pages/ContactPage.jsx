import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, MessageSquare, HeadphonesIcon, CheckCircle } from "lucide-react";

const contacts = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Customer Service Hotline",
    color: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600",
    items: [
      { label: "Main Line", value: "+234 (0) 802-KINGS-1 | 080-2546-4771" },
      { label: "Orders & Delivery", value: "+234 (0) 901-CHOPS-1 | 090-1246-7711" },
      { label: "Corporate Orders", value: "+234 (0) 708-FEAST-5 | 070-8332-7855" },
      { label: "Complaints", value: "+234 (0) 811-HELP-24 | 081-1435-7242" },
    ],
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Us",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    iconColor: "text-orange-600",
    items: [
      { label: "General Inquiries", value: "hello@kingschops.ng" },
      { label: "Orders & Support", value: "orders@kingschops.ng" },
      { label: "Business / Partnerships", value: "partner@kingschops.ng" },
      { label: "Feedback & Reviews", value: "feedback@kingschops.ng" },
    ],
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Our Locations",
    color: "bg-rose-50 border-rose-200 text-rose-700",
    iconColor: "text-rose-600",
    items: [
      { label: "Head Office", value: "No. 1 Plasma District, Ikeja, Lagos" },
      { label: "Island Outlet", value: "45 Adeola Odeku St, Victoria Island, Lagos" },
      { label: "Lekki Branch", value: "12 Freedom Way, Lekki Phase 1, Lagos" },
      { label: "Surulere Branch", value: "22 Bode Thomas Street, Surulere, Lagos" },
    ],
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Opening Hours",
    color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    iconColor: "text-yellow-600",
    items: [
      { label: "Monday – Friday", value: "7:00 AM – 11:00 PM" },
      { label: "Saturday", value: "9:00 AM – 12:00 AM (Midnight)" },
      { label: "Sunday", value: "10:00 AM – 10:00 PM" },
      { label: "Public Holidays", value: "11:00 AM – 9:00 PM" },
    ],
  },
];

const faqs = [
  { q: "How long does delivery take?", a: "We deliver within 25–45 minutes depending on your location within Lagos. Our express delivery takes 15–20 minutes for nearby areas." },
  { q: "Do you cater for events and parties?", a: "Yes! We offer bulk and party orders for any occasion. Contact us at partner@kingschops.ng or call our Corporate Orders line for custom packages." },
  { q: "Can I track my order?", a: "Absolutely. Once your order is placed, you'll receive an SMS with a tracking link. You can also call our hotline for real-time updates." },
  { q: "What payment methods do you accept?", a: "We accept cash on delivery, bank transfers, Paystack, Flutterwave, and all major debit/credit cards." },
];

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-linear-to-br from-yellow-600 via-orange-500 to-rose-700 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-black opacity-5 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <HeadphonesIcon className="w-12 h-12 text-yellow-200" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-['Georgia'] mb-3">
            Contact <span className="text-yellow-200">Us</span>
          </h1>
          <p className="text-orange-100 text-lg">
            We're always here for you with 24/7 customer support, multiple channels, one goal: your satisfaction.
          </p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {contacts.map((card, i) => (
            <div key={i} className={`rounded-2xl border p-5 ${card.color} hover:shadow-md transition-all`}>
              <div className={`flex items-center gap-2 mb-4 font-bold ${card.iconColor}`}>
                {card.icon}
                <span className="text-sm">{card.title}</span>
              </div>
              <ul className="space-y-2.5">
                {card.items.map((item, j) => (
                  <li key={j}>
                    <p className="text-xs font-semibold opacity-70 mb-0.5">{item.label}</p>
                    <p className="text-xs font-medium leading-relaxed">{item.value}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Form + Live Chat + WhatsApp */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          {/* Form */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-['Georgia'] text-gray-800 mb-6">
              Send Us a <span className="text-orange-600">Message</span>
            </h2>
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 font-['Georgia'] mb-2">Message Sent! 🎉</h3>
                <p className="text-gray-500 text-sm">
                  Thank you for reaching out. Our team will respond within <strong>2–4 hours</strong> on business days.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="mt-5 bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-700 transition-all cursor-pointer"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 bg-orange-50 p-7 rounded-2xl border border-orange-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Name <span className="text-red-500">*</span></label>
                    <input
                      name="name" type="text" required value={form.name} onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Email <span className="text-red-500">*</span></label>
                    <input
                      name="email" type="email" required value={form.email} onChange={handleChange}
                      placeholder="you@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone</label>
                    <input
                      name="phone" type="tel" value={form.phone} onChange={handleChange}
                      placeholder="+234 900 000 0000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Subject <span className="text-red-500">*</span></label>
                    <select
                      name="subject" required value={form.subject} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                    >
                      <option value="">Select a topic</option>
                      <option>Order Issue</option>
                      <option>Delivery Complaint</option>
                      <option>General Inquiry</option>
                      <option>Partnership / Catering</option>
                      <option>Feedback</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Message <span className="text-red-500">*</span></label>
                  <textarea
                    name="message" required value={form.message} onChange={handleChange}
                    rows={5} placeholder="Tell us how we can help..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white resize-none"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-linear-to-r from-orange-600 to-rose-600 text-white py-3 rounded-xl font-bold hover:from-orange-700 hover:to-rose-700 transition-all hover:scale-[1.01] disabled:opacity-60 cursor-pointer shadow-md"
                >
                  {loading ? "Sending..." : "Send Message →"}
                </button>
              </form>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-5">
            <h2 className="text-2xl font-bold font-['Georgia'] text-gray-800">Quick <span className="text-orange-600">Contact</span></h2>

            <a
              href="https://wa.me/2348025462771"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-5 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shrink-0 group-hover:scale-110 transition-transform">
                💬
              </div>
              <div>
                <p className="font-bold text-gray-800">WhatsApp Us</p>
                <p className="text-sm text-gray-500">Chat with us instantly on WhatsApp</p>
                <p className="text-green-600 font-semibold text-sm mt-0.5">+234 802-546-2771</p>
              </div>
            </a>

            <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl shrink-0">
                🎧
              </div>
              <div>
                <p className="font-bold text-gray-800">Live Chat Support</p>
                <p className="text-sm text-gray-500">Available Mon–Fri, 8am–10pm</p>
                <span className="inline-block mt-1 bg-green-400 text-white text-xs px-2 py-0.5 rounded-full font-semibold">● Online Now</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl shrink-0">
                📞
              </div>
              <div>
                <p className="font-bold text-gray-800">Call Us Now</p>
                <p className="text-sm text-gray-500">Toll-free customer service</p>
                <p className="text-orange-600 font-semibold text-sm mt-0.5">0800-KINGS-24 (546-4724)</p>
              </div>
            </div>

            <div className="bg-linear-to-br from-orange-600 to-rose-600 text-white rounded-2xl p-5">
              <MessageSquare className="w-8 h-8 mb-3 text-orange-200" />
              <p className="font-bold text-lg font-['Georgia']">We respond fast!</p>
              <p className="text-orange-100 text-sm mt-1">
                Average response time: <strong>under 30 minutes</strong> via WhatsApp and phone.
                Email within 4 hours.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-['Georgia'] text-gray-800 text-center mb-8">
            Frequently Asked <span className="text-orange-600">Questions</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-orange-50 border border-orange-100 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center cursor-pointer"
                >
                  <span className="font-semibold text-gray-800 text-sm">{faq.q}</span>
                  <span className="text-orange-500 font-bold text-xl shrink-0 ml-3">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
