import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import {
  FontAwesomeIcon,
} from "@fortawesome/react-fontawesome";

import {
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  MapPin,
} from "lucide-react";

import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

import {
  useAuth,
} from "../AuthContext.jsx";


const countryNames =
  new Intl.DisplayNames(
    ["en"],
    {
      type: "region",
    },
  );


const countries =
  getCountries()
    .map((code) => ({
      code,
      name:
        countryNames.of(code) ||
        code,
      dialCode:
        `+${getCountryCallingCode(code)}`,
    }))
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name),
    );


const nigeriaStates = [
  {
    name: "Abia",
    capital: "Umuahia",
  },
  {
    name: "Adamawa",
    capital: "Yola",
  },
  {
    name: "Akwa Ibom",
    capital: "Uyo",
  },
  {
    name: "Anambra",
    capital: "Awka",
  },
  {
    name: "Bauchi",
    capital: "Bauchi",
  },
  {
    name: "Bayelsa",
    capital: "Yenagoa",
  },
  {
    name: "Benue",
    capital: "Makurdi",
  },
  {
    name: "Borno",
    capital: "Maiduguri",
  },
  {
    name: "Cross River",
    capital: "Calabar",
  },
  {
    name: "Delta",
    capital: "Asaba",
  },
  {
    name: "Ebonyi",
    capital: "Abakaliki",
  },
  {
    name: "Edo",
    capital: "Benin City",
  },
  {
    name: "Ekiti",
    capital: "Ado-Ekiti",
  },
  {
    name: "Enugu",
    capital: "Enugu",
  },
  {
    name: "Gombe",
    capital: "Gombe",
  },
  {
    name: "Imo",
    capital: "Owerri",
  },
  {
    name: "Jigawa",
    capital: "Dutse",
  },
  {
    name: "Kaduna",
    capital: "Kaduna",
  },
  {
    name: "Kano",
    capital: "Kano",
  },
  {
    name: "Katsina",
    capital: "Katsina",
  },
  {
    name: "Kebbi",
    capital: "Birnin Kebbi",
  },
  {
    name: "Kogi",
    capital: "Lokoja",
  },
  {
    name: "Kwara",
    capital: "Ilorin",
  },
  {
    name: "Lagos",
    capital: "Ikeja",
  },
  {
    name: "Nasarawa",
    capital: "Lafia",
  },
  {
    name: "Niger",
    capital: "Minna",
  },
  {
    name: "Ogun",
    capital: "Abeokuta",
  },
  {
    name: "Ondo",
    capital: "Akure",
  },
  {
    name: "Osun",
    capital: "Osogbo",
  },
  {
    name: "Oyo",
    capital: "Ibadan",
  },
  {
    name: "Plateau",
    capital: "Jos",
  },
  {
    name: "Rivers",
    capital: "Port Harcourt",
  },
  {
    name: "Sokoto",
    capital: "Sokoto",
  },
  {
    name: "Taraba",
    capital: "Jalingo",
  },
  {
    name: "Yobe",
    capital: "Damaturu",
  },
  {
    name: "Zamfara",
    capital: "Gusau",
  },
  {
    name: "Federal Capital Territory",
    capital: "Abuja",
  },
];


function Register() {
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedCountry,
    setSelectedCountry,
  ] = useState("NG");

  const [
    selectedState,
    setSelectedState,
  ] = useState("");

  const [
    formData,
    setFormData,
  ] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    capital: "",
  });

  const {
    register,
    googleLogin,
    isAuthenticated,
  } = useAuth();

  const navigate =
    useNavigate();

  const googleButtonRef =
    useRef(null);


  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        "/",
        {
          replace: true,
        },
      );
    }
  }, [
    isAuthenticated,
    navigate,
  ]);


  const handleGoogleResponse =
    useCallback(
      async (response) => {
        if (
          loading ||
          googleLoading
        ) {
          return;
        }

        if (!response?.credential) {
          setError(
            "Google authentication failed.",
          );
          return;
        }

        setGoogleLoading(true);
        setError("");

        try {
          await googleLogin(
            response.credential,
            true,
          );

          navigate(
            "/",
            {
              replace: true,
            },
          );
        } catch (err) {
          console.error(
            "Google registration error:",
            err,
          );

          setError(
            err?.message ||
              "Google sign-up failed. Please try again.",
          );
        } finally {
          setGoogleLoading(false);
        }
      },
      [
        googleLogin,
        navigate,
        loading,
        googleLoading,
      ],
    );


  useEffect(() => {
    let mounted = true;

    const initializeGoogle =
      () => {
        if (
          !mounted ||
          !window.google ||
          !import.meta.env
            .VITE_GOOGLE_CLIENT_ID
        ) {
          return;
        }

        if (
          !googleButtonRef.current
        ) {
          return;
        }

        window.google.accounts.id.initialize(
          {
            client_id:
              import.meta.env
                .VITE_GOOGLE_CLIENT_ID,
            callback:
              handleGoogleResponse,
          },
        );

        googleButtonRef.current.innerHTML =
          "";

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: "outline",
            size: "large",
            width:
              googleButtonRef.current
                .offsetWidth,
            text: "signup_with",
            shape: "rectangular",
          },
        );
      };


    const scriptId =
      "google-gsi-script";

    const existingScript =
      document.getElementById(
        scriptId,
      );

    if (existingScript) {
      if (window.google) {
        initializeGoogle();
      } else {
        existingScript.addEventListener(
          "load",
          initializeGoogle,
        );
      }

      return () => {
        mounted = false;

        existingScript.removeEventListener(
          "load",
          initializeGoogle,
        );
      };
    }


    const script =
      document.createElement(
        "script",
      );

    script.id =
      scriptId;

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload =
      initializeGoogle;

    document.body.appendChild(
      script,
    );


    return () => {
      mounted = false;
      script.onload = null;
    };
  }, [
    handleGoogleResponse,
  ]);


  const handleChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setFormData(
        (previous) => ({
          ...previous,
          [name]: value,
        }),
      );

      setError("");
    };


  const handleCountryChange =
    (e) => {
      setSelectedCountry(
        e.target.value,
      );

      setSelectedState("");

      setFormData(
        (previous) => ({
          ...previous,
          capital: "",
        }),
      );

      setError("");
    };


  const handleStateChange =
    (e) => {
      const state =
        e.target.value;

      setSelectedState(state);

      if (
        selectedCountry === "NG"
      ) {
        const selected =
          nigeriaStates.find(
            (item) =>
              item.name === state,
          );

        setFormData(
          (previous) => ({
            ...previous,
            capital:
              selected?.capital ||
              "",
          }),
        );
      }

      setError("");
    };


  const validatePhone =
    () => {
      try {
        const number =
          parsePhoneNumberFromString(
            formData.phone,
            selectedCountry,
          );

        if (!number) {
          return null;
        }

        if (
          !number.isValid()
        ) {
          return null;
        }

        if (
          number.country !==
          selectedCountry
        ) {
          return null;
        }

        return number.number;
      } catch {
        return null;
      }
    };


  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (
        loading ||
        googleLoading
      ) {
        return;
      }

      setError("");

      if (
        !formData.firstName.trim() ||
        !formData.lastName.trim()
      ) {
        setError(
          "First name and last name are required.",
        );
        return;
      }

      if (
        formData.password.length <
        8
      ) {
        setError(
          "Password must be at least 8 characters.",
        );
        return;
      }

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        setError(
          "Passwords do not match.",
        );
        return;
      }

      const normalizedEmail =
        formData.email
          .trim()
          .toLowerCase();

      if (
        !/^\S+@\S+\.\S+$/.test(
          normalizedEmail,
        )
      ) {
        setError(
          "Please enter a valid email address.",
        );
        return;
      }

      if (
        !formData.phone.trim()
      ) {
        setError(
          "Phone number is required.",
        );
        return;
      }

      const formattedPhone =
        validatePhone();

      if (!formattedPhone) {
        setError(
          `Your phone number does not match ${countryNames.of(selectedCountry)}.`,
        );
        return;
      }

      if (
        !selectedState.trim()
      ) {
        setError(
          "Please enter your state.",
        );
        return;
      }

      if (
        !formData.capital.trim()
      ) {
        setError(
          "Please enter your capital.",
        );
        return;
      }

      if (
        !formData.address.trim()
      ) {
        setError(
          "Please enter your delivery address.",
        );
        return;
      }

      const selectedCountryName =
        countryNames.of(
          selectedCountry,
        ) ||
        selectedCountry;

      setLoading(true);

      try {
        await register({
          firstName:
            formData.firstName.trim(),

          lastName:
            formData.lastName.trim(),

          email:
            normalizedEmail,

          phone:
            formattedPhone,

          password:
            formData.password,

          country:
            selectedCountryName,

          countryCode:
            selectedCountry,

          state:
            selectedState.trim(),

          capital:
            formData.capital.trim(),

          address:
            formData.address.trim(),
        });

        navigate(
          "/",
          {
            replace: true,
          },
        );
      } catch (err) {
        console.error(
          "Registration error:",
          err,
        );

        setError(
          err?.message ||
            "Registration failed. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="min-h-screen bg-linear-to-br from-[#3b2418] via-[#5a3825] to-[#7a4a2d] flex items-center justify-center px-4 py-12">

      <div className="relative w-full max-w-lg">

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <div className="bg-linear-to-r from-[#3b2418] via-[#5a3825] to-[#8b5e3c] px-8 py-6 text-center">

            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-2"
            >

              <FontAwesomeIcon
                icon={faCrown}
                className="text-white text-3xl"
              />

              <h1 className="font-['Georgia'] font-bold text-2xl text-white">

                Kings{" "}

                <span className="text-[#d9b99b]">
                  Chops
                </span>

              </h1>

            </Link>

            <p className="text-[#ead9cc] text-sm">
              Create your account and start ordering
            </p>

          </div>


          <div className="px-8 py-8">

            <h2 className="text-2xl font-bold text-[#3b2418] mb-6 font-['Georgia']">
              Welcome to Kings Chops 🍕
            </h2>


            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">

                <AlertCircle className="w-4 h-4 shrink-0" />

                <span>
                  {error}
                </span>

              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    First Name *
                  </label>

                  <div className="relative">

                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5e3c] w-4 h-4" />

                    <input
                      type="text"
                      name="firstName"
                      required
                      value={
                        formData.firstName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="John"
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#e5d8cf] focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] text-sm"
                    />

                  </div>

                </div>


                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Last Name *
                  </label>

                  <div className="relative">

                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5e3c] w-4 h-4" />

                    <input
                      type="text"
                      name="lastName"
                      required
                      value={
                        formData.lastName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Doe"
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#e5d8cf] focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] text-sm"
                    />

                  </div>

                </div>

              </div>


              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address *
                </label>

                <div className="relative">

                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5e3c] w-5 h-5" />

                  <input
                    type="email"
                    name="email"
                    required
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e5d8cf] focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] text-sm"
                  />

                </div>

              </div>


              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Country *
                </label>

                <select
                  value={
                    selectedCountry
                  }
                  onChange={
                    handleCountryChange
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#e5d8cf] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c7ad9b]"
                >

                  {countries.map(
                    (country) => (
                      <option
                        key={
                          country.code
                        }
                        value={
                          country.code
                        }
                      >
                        {
                          country.name
                        }{" "}
                        (
                        {
                          country.dialCode
                        }
                        )
                      </option>
                    ),
                  )}

                </select>

              </div>


              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number *
                </label>

                <div className="relative">

                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5e3c] w-5 h-5" />

                  <input
                    type="tel"
                    name="phone"
                    required
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="801 234 5678"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e5d8cf] focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] text-sm"
                  />

                </div>

                <p className="text-xs text-gray-400 mt-1.5">
                  Your phone number must belong to the selected country.
                </p>

              </div>


              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  State *
                </label>

                {selectedCountry === "NG" ? (
                  <select
                    value={
                      selectedState
                    }
                    onChange={
                      handleStateChange
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#e5d8cf] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c7ad9b]"
                  >

                    <option value="">
                      Select your state
                    </option>

                    {nigeriaStates.map(
                      (item) => (
                        <option
                          key={
                            item.name
                          }
                          value={
                            item.name
                          }
                        >
                          {
                            item.name
                          }
                        </option>
                      ),
                    )}

                  </select>
                ) : (
                  <input
                    type="text"
                    value={
                      selectedState
                    }
                    onChange={(e) =>
                      setSelectedState(
                        e.target.value,
                      )
                    }
                    placeholder="Enter your state"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#e5d8cf] text-sm focus:outline-none focus:ring-2 focus:ring-[#c7ad9b]"
                  />
                )}

              </div>


              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Capital *
                </label>

                <div className="relative">

                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5e3c] w-5 h-5" />

                  <input
                    type="text"
                    name="capital"
                    required
                    value={
                      formData.capital
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your capital"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e5d8cf] focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] text-sm"
                  />

                </div>

              </div>


              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Delivery Address *
                </label>

                <div className="relative">

                  <MapPin className="absolute left-3 top-3 text-[#8b5e3c] w-5 h-5" />

                  <textarea
                    name="address"
                    required
                    value={
                      formData.address
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your full delivery address"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e5d8cf] focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] text-sm resize-none"
                  />

                </div>

                <p className="text-xs text-gray-400 mt-1.5">
                  Enter the address where you want your orders delivered.
                </p>

              </div>


              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password *
                </label>

                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5e3c] w-5 h-5" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    required
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#e5d8cf] text-sm focus:outline-none focus:ring-2 focus:ring-[#c7ad9b]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >

                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}

                  </button>

                </div>

              </div>


              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password *
                </label>

                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5e3c] w-5 h-5" />

                  <input
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    required
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#e5d8cf] text-sm focus:outline-none focus:ring-2 focus:ring-[#c7ad9b]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        !showConfirm,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >

                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}

                  </button>

                </div>

              </div>


              <div className="flex items-start gap-2 pt-1">

                <input
                  type="checkbox"
                  required
                  id="terms"
                  className="mt-1 accent-[#7a4a2d]"
                />

                <label
                  htmlFor="terms"
                  className="text-sm text-gray-500"
                >
                  I agree to the{" "}

                  <span className="text-[#7a4a2d] font-semibold">
                    Terms of Service
                  </span>{" "}

                  and{" "}

                  <span className="text-[#7a4a2d] font-semibold">
                    Privacy Policy
                  </span>

                </label>

              </div>


              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
                className="w-full bg-linear-to-r from-[#5a3825] to-[#8b5e3c] text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-60 cursor-pointer"
              >

                {loading
                  ? "Creating account..."
                  : "Create My Account"}

              </button>

            </form>


            <div className="flex items-center my-5">

              <div className="flex-1 border-t border-[#e5d8cf]" />

              <span className="px-4 text-sm text-gray-400">
                or
              </span>

              <div className="flex-1 border-t border-[#e5d8cf]" />

            </div>


            <div
              ref={googleButtonRef}
              className={`w-full flex justify-center ${
                googleLoading
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            />


            <p className="text-center mt-5 text-sm text-gray-500">

              Already have an account?{" "}

              <Link
                to="/login"
                className="text-[#7a4a2d] font-semibold hover:underline"
              >
                Sign in here
              </Link>

            </p>

          </div>

        </div>


        <p className="text-center text-white/70 text-xs mt-4">
          © {new Date().getFullYear()} Kings Chops. All rights reserved.
        </p>

      </div>
    </div>
  );
}


export default Register;