import React, {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "../AuthContext.jsx";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  FontAwesomeIcon,
} from "@fortawesome/react-fontawesome";

import {
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  ShoppingBag,
  Shield,
  Pencil,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Home,
} from "lucide-react";

import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

// ─────────────────────────────────────────────────────────────
// COUNTRY DATA
// ─────────────────────────────────────────────────────────────

const countryNames =
  new Intl.DisplayNames(
    ["en"],
    {
      type: "region",
    }
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
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );

// ─────────────────────────────────────────────────────────────
// NIGERIA STATES AND CAPITALS
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

function ProfilePage() {
  const {
    user,
    updateProfile,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      phone: "",
      country: "",
      countryCode: "",
      state: "",
      capital: "",
      address: "",
    });

  const [editing, setEditing] =
    useState(null);

  const [saving, setSaving] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ─────────────────────────────────────────────────────────────
  // LOAD USER
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      firstName:
        user.firstName || "",

      lastName:
        user.lastName || "",

      phone:
        user.phone || "",

      country:
        user.country || "",

      countryCode:
        user.countryCode || "",

      state:
        user.state || "",

      capital:
        user.capital || "",

      address:
        user.address || "",
    });
  }, [user]);

  // ─────────────────────────────────────────────────────────────
  // START EDITING
  // ─────────────────────────────────────────────────────────────

  const startEditing = (
    field
  ) => {
    setError("");
    setSuccess("");
    setEditing(field);
  };

  // ─────────────────────────────────────────────────────────────
  // CANCEL
  // ─────────────────────────────────────────────────────────────

  const cancelEditing = () => {
    setError("");
    setSuccess("");
    setEditing(null);

    if (!user) {
      return;
    }

    setFormData({
      firstName:
        user.firstName || "",

      lastName:
        user.lastName || "",

      phone:
        user.phone || "",

      country:
        user.country || "",

      countryCode:
        user.countryCode || "",

      state:
        user.state || "",

      capital:
        user.capital || "",

      address:
        user.address || "",
    });
  };

  // ─────────────────────────────────────────────────────────────
  // GENERAL INPUT
  // ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setError("");
    setSuccess("");
  };

  // ─────────────────────────────────────────────────────────────
  // COUNTRY CHANGE
  // ─────────────────────────────────────────────────────────────

  const handleCountryChange = (
    e
  ) => {
    const code =
      e.target.value;

    const name =
      countryNames.of(code) ||
      code;

    setFormData(
      (previous) => ({
        ...previous,

        countryCode:
          code,

        country:
          name,

        state:
          code === "NG"
            ? ""
            : previous.state,

        capital:
          code === "NG"
            ? ""
            : previous.capital,
      })
    );

    setError("");
    setSuccess("");
  };

  // ─────────────────────────────────────────────────────────────
  // STATE CHANGE
  // ─────────────────────────────────────────────────────────────

  const handleStateChange = (
    e
  ) => {
    const state =
      e.target.value;

    let capital = "";

    if (
      formData.countryCode ===
      "NG"
    ) {
      const selectedState =
        nigeriaStates.find(
          (item) =>
            item.name === state
        );

      capital =
        selectedState?.capital ||
        "";
    }

    setFormData(
      (previous) => ({
        ...previous,
        state,
        capital,
      })
    );

    setError("");
    setSuccess("");
  };

  // ─────────────────────────────────────────────────────────────
  // PHONE VALIDATION
  // ─────────────────────────────────────────────────────────────

  const getValidPhone = () => {
    try {
      if (
        !formData.phone.trim()
      ) {
        return null;
      }

      if (
        !formData.countryCode
      ) {
        return null;
      }

      const number =
        parsePhoneNumberFromString(
          formData.phone,
          formData.countryCode
        );

      if (!number) {
        return null;
      }

      if (!number.isValid()) {
        return null;
      }

      if (
        number.country !==
        formData.countryCode
      ) {
        return null;
      }

      return number.number;
    } catch {
      return null;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SAVE FIELD
  // ─────────────────────────────────────────────────────────────

  const saveField = async (
    field
  ) => {
    setError("");
    setSuccess("");

    let value =
      formData[field]
        ?.trim() || "";

    // ─────────────────────────────────────────────────────────
    // FIRST NAME
    // ─────────────────────────────────────────────────────────

    if (
      field === "firstName" &&
      !value
    ) {
      setError(
        "First name is required."
      );
      return;
    }

    // ─────────────────────────────────────────────────────────
    // LAST NAME
    // ─────────────────────────────────────────────────────────

    if (
      field === "lastName" &&
      !value
    ) {
      setError(
        "Last name is required."
      );
      return;
    }

    // ─────────────────────────────────────────────────────────
    // PHONE
    // ─────────────────────────────────────────────────────────

    if (
      field === "phone"
    ) {
      if (!value) {
        setError(
          "Enter your phone number."
        );
        return;
      }

      if (
        !formData.countryCode
      ) {
        setError(
          "Select your country before saving your phone number."
        );
        return;
      }

      const formattedPhone =
        getValidPhone();

      if (!formattedPhone) {
        setError(
          "Your phone number does not match your selected country."
        );
        return;
      }

      value =
        formattedPhone;
    }

    // ─────────────────────────────────────────────────────────
    // COUNTRY
    // ─────────────────────────────────────────────────────────

    if (
      field === "country"
    ) {
      if (
        !formData.countryCode
      ) {
        setError(
          "Select your country."
        );
        return;
      }

      value =
        countryNames.of(
          formData.countryCode
        ) ||
        formData.country;
    }

    // ─────────────────────────────────────────────────────────
    // COUNTRY CODE
    // ─────────────────────────────────────────────────────────

    if (
      field === "countryCode"
    ) {
      if (!value) {
        setError(
          "Select your country."
        );
        return;
      }
    }

    // ─────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────

    if (
      field === "state"
    ) {
      if (!value) {
        setError(
          "Select your state."
        );
        return;
      }

      if (
        formData.countryCode ===
        "NG"
      ) {
        const selectedState =
          nigeriaStates.find(
            (item) =>
              item.name === value
          );

        if (!selectedState) {
          setError(
            "Please select a valid Nigerian state."
          );
          return;
        }

        value =
          selectedState.name;
      }
    }

    // ─────────────────────────────────────────────────────────
    // CAPITAL
    // ─────────────────────────────────────────────────────────

    if (
      field === "capital"
    ) {
      if (!value) {
        setError(
          "Capital is required."
        );
        return;
      }
    }

    // ─────────────────────────────────────────────────────────
    // DELIVERY ADDRESS
    // ─────────────────────────────────────────────────────────

    if (
      field === "address"
    ) {
      if (!value) {
        setError(
          "Delivery address is required."
        );
        return;
      }

      if (value.length > 300) {
        setError(
          "Delivery address cannot exceed 300 characters."
        );
        return;
      }
    }

    try {
      setSaving(field);

      // ───────────────────────────────────────────────────────
      // NORMAL FIELD SAVE
      // ───────────────────────────────────────────────────────

      if (field !== "state") {
        const data =
          await updateProfile(
            field,
            value,
            formData.countryCode
          );

        if (
          data &&
          data.user
        ) {
          setFormData({
            firstName:
              data.user.firstName ||
              "",

            lastName:
              data.user.lastName ||
              "",

            phone:
              data.user.phone ||
              "",

            country:
              data.user.country ||
              "",

            countryCode:
              data.user.countryCode ||
              "",

            state:
              data.user.state ||
              "",

            capital:
              data.user.capital ||
              "",

            address:
              data.user.address ||
              "",
          });
        }

        setEditing(null);

        setSuccess(
          `${getFieldLabel(
            field
          )} updated successfully.`
        );

        return;
      }

      // ───────────────────────────────────────────────────────
      // STATE + CAPITAL SAVE
      // ───────────────────────────────────────────────────────

      let capital =
        formData.capital?.trim() ||
        "";

      if (
        formData.countryCode ===
        "NG"
      ) {
        const selectedState =
          nigeriaStates.find(
            (item) =>
              item.name === value
          );

        capital =
          selectedState?.capital ||
          "";
      }

      if (!capital) {
        setError(
          "The capital could not be detected for this state."
        );
        return;
      }

      const stateData =
        await updateProfile(
          "state",
          value,
          formData.countryCode
        );

      const capitalData =
        await updateProfile(
          "capital",
          capital,
          formData.countryCode
        );

      const updatedUser =
        capitalData?.user ||
        stateData?.user;

      if (updatedUser) {
        setFormData({
          firstName:
            updatedUser.firstName ||
            "",

          lastName:
            updatedUser.lastName ||
            "",

          phone:
            updatedUser.phone ||
            "",

          country:
            updatedUser.country ||
            "",

          countryCode:
            updatedUser.countryCode ||
            "",

          state:
            updatedUser.state ||
            "",

          capital:
            updatedUser.capital ||
            "",

          address:
            updatedUser.address ||
            "",
        });
      }

      setEditing(null);

      setSuccess(
        "State and capital updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile save error:",
        error
      );

      setError(
        error.message ||
          "Could not update your profile. Please try again."
      );
    } finally {
      setSaving(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FIELD LABEL
  // ─────────────────────────────────────────────────────────────

  const getFieldLabel = (
    field
  ) => {
    const labels = {
      firstName:
        "First name",

      lastName:
        "Last name",

      phone:
        "Phone number",

      country:
        "Country",

      countryCode:
        "Country",

      state:
        "State",

      capital:
        "Capital",

      address:
        "Delivery address",
    };

    return (
      labels[field] ||
      "Profile"
    );
  };

  // ─────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────

  const handleLogout =
    async () => {
      await logout();

      navigate("/", {
        replace: true,
      });
    };

  if (!user) {
    return null;
  }

  // ─────────────────────────────────────────────────────────────
  // INITIALS
  // ─────────────────────────────────────────────────────────────

  const initials =
    `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`
      .toUpperCase();

  // ─────────────────────────────────────────────────────────────
  // EDIT BUTTON
  // ─────────────────────────────────────────────────────────────

  const renderEditButton = (
    field
  ) => {
    if (
      editing === field
    ) {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              saveField(field)
            }
            disabled={
              saving === field
            }
            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={
              cancelEditing
            }
            disabled={
              saving === field
            }
            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() =>
          startEditing(field)
        }
        className="p-2 rounded-lg text-[#8b5e3c] hover:bg-[#faf4ef] transition-colors"
        title={`Edit ${getFieldLabel(
          field
        )}`}
      >
        <Pencil className="w-4 h-4" />
      </button>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // TEXT FIELD
  // ─────────────────────────────────────────────────────────────

  const renderTextField = (
    field,
    icon,
    type = "text",
    placeholder = ""
  ) => {
    const Icon = icon;

    return (
      <div className="py-4 border-b border-[#f1ebe6]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Icon className="w-4 h-4" />

            {getFieldLabel(
              field
            )}
          </div>

          {renderEditButton(
            field
          )}
        </div>

        {editing === field ? (
          <div className="mt-3">
            <input
              type={type}
              name={field}
              value={
                formData[field]
              }
              onChange={
                handleChange
              }
              placeholder={
                placeholder
              }
              autoFocus
              disabled={
                saving === field
              }
              className="w-full px-4 py-3 rounded-xl border border-[#e5d8cf] text-sm focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] disabled:bg-gray-50"
            />

            {saving === field && (
              <p className="text-xs text-gray-400 mt-2">
                Saving...
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#3b2418] mt-2 break-all">
            {formData[field] ||
              "Not added"}
          </p>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // DELIVERY ADDRESS FIELD
  // ─────────────────────────────────────────────────────────────

  const renderAddressField = () => {
    const field =
      "address";

    return (
      <div className="py-4 border-b border-[#f1ebe6]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Home className="w-4 h-4" />

            Delivery Address
          </div>

          {renderEditButton(
            field
          )}
        </div>

        {editing === field ? (
          <div className="mt-3">
            <textarea
              name="address"
              value={
                formData.address
              }
              onChange={
                handleChange
              }
              placeholder="Enter your house number, street, estate, landmark, or other delivery details"
              rows={4}
              maxLength={300}
              autoFocus
              disabled={
                saving === field
              }
              className="w-full px-4 py-3 rounded-xl border border-[#e5d8cf] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] disabled:bg-gray-50"
            />

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                Use an address where your order can be delivered.
              </p>

              <p className="text-xs text-gray-400">
                {formData.address.length}/300
              </p>
            </div>

            {saving === field && (
              <p className="text-xs text-gray-400 mt-2">
                Saving...
              </p>
            )}
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm font-semibold text-[#3b2418] wrap-break-word">
              {formData.address ||
                "Not added"}
            </p>

            {!formData.address && (
              <p className="text-xs text-gray-400 mt-1">
                Add your delivery address before placing an order.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // PAGE
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#faf9f6] py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* PROFILE HEADER */}

        <div className="bg-linear-to-r from-[#3b2418] via-[#5a3825] to-[#7a4a2d] rounded-2xl p-8 text-white text-center mb-6 shadow-lg">

          {user.profilePicture ? (
            <img
              src={
                user.profilePicture
              }
              alt={
                formData.firstName
              }
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md bg-[#8b5e3c] flex items-center justify-center text-3xl font-bold font-['Georgia']">
              {initials}
            </div>
          )}

          <h1 className="text-2xl font-bold font-['Georgia']">
            Welcome,{" "}
            {formData.firstName} 
          </h1>

          <p className="text-[#ead9cc] text-sm mt-1">
            {user.email}
          </p>

          <span className="inline-block mt-3 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
            {user.authProvider ===
            "google"
              ? " Google Account"
              : " Email Account"}
          </span>
        </div>

        {/* ERROR */}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />

            <span>
              {error}
            </span>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm">
            <CheckCircle className="w-4 h-4" />

            <span>
              {success}
            </span>
          </div>
        )}

        {/* ACCOUNT DETAILS */}

        <div className="bg-white rounded-2xl shadow-sm border border-[#eadfd6] p-6 mb-6">

          <h2 className="font-bold text-[#3b2418] font-['Georgia'] text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#8b5e3c]" />

            Account Details
          </h2>

          {renderTextField(
            "firstName",
            User,
            "text",
            "First name"
          )}

          {renderTextField(
            "lastName",
            User,
            "text",
            "Last name"
          )}

          {/* EMAIL */}

          <div className="py-4 border-b border-[#f1ebe6]">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Mail className="w-4 h-4" />

              Email
            </div>

            <p className="text-sm font-semibold text-[#3b2418] mt-2 break-all">
              {user.email}
            </p>

            <p className="text-xs text-gray-400 mt-1.5">
              Email is tied to your account and cannot be edited here.
            </p>
          </div>

          {/* PHONE */}

          {renderTextField(
            "phone",
            Phone,
            "tel",
            "801 234 5678"
          )}

          {/* COUNTRY */}

          <div className="py-4 border-b border-[#f1ebe6]">
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <MapPin className="w-4 h-4" />

                Country
              </div>

              {renderEditButton(
                "country"
              )}
            </div>

            {editing ===
            "country" ? (
              <div className="mt-3">
                <select
                  name="countryCode"
                  value={
                    formData.countryCode
                  }
                  onChange={
                    handleCountryChange
                  }
                  disabled={
                    saving ===
                    "country"
                  }
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-[#e5d8cf] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c7ad9b]"
                >
                  <option value="">
                    Select your country
                  </option>

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
                    )
                  )}
                </select>
              </div>
            ) : (
              <p className="text-sm font-semibold text-[#3b2418] mt-2">
                {formData.country ||
                  "Not added"}
              </p>
            )}
          </div>

          {/* STATE */}

          <div className="py-4 border-b border-[#f1ebe6]">
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <MapPin className="w-4 h-4" />

                State
              </div>

              {renderEditButton(
                "state"
              )}
            </div>

            {editing ===
            "state" ? (
              <div className="mt-3">

                {formData.countryCode ===
                "NG" ? (
                  <select
                    name="state"
                    value={
                      formData.state
                    }
                    onChange={
                      handleStateChange
                    }
                    disabled={
                      saving ===
                      "state"
                    }
                    autoFocus
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
                      )
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="state"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your state"
                    autoFocus
                    disabled={
                      saving ===
                      "state"
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#e5d8cf] text-sm focus:outline-none focus:ring-2 focus:ring-[#c7ad9b]"
                  />
                )}

                {formData.countryCode ===
                  "NG" &&
                  formData.capital && (
                    <div className="mt-3 px-4 py-3 rounded-xl bg-[#faf4ef] border border-[#eadfd6]">
                      <p className="text-xs text-gray-500">
                        State Capital
                      </p>

                      <p className="text-sm font-semibold text-[#3b2418] mt-1">
                        {
                          formData.capital
                        }
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        The capital will be saved automatically with the state.
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-sm font-semibold text-[#3b2418] mt-2">
                {formData.state ||
                  "Not added"}
              </p>
            )}
          </div>

          {/* CAPITAL */}

          <div className="py-4 border-b border-[#f1ebe6]">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <MapPin className="w-4 h-4" />

              Capital
            </div>

            <p className="text-sm font-semibold text-[#3b2418] mt-2">
              {formData.capital ||
                "Not added"}
            </p>

            {formData.countryCode ===
              "NG" &&
              formData.state && (
                <p className="text-xs text-gray-400 mt-1">
                  Capital is automatically determined from your selected state.
                </p>
              )}
          </div>

          {/* DELIVERY ADDRESS */}

          {renderAddressField()}

        </div>

        {/* LOCATION SUMMARY */}

        <div className="bg-white rounded-2xl shadow-sm border border-[#eadfd6] p-6 mb-6">

          <h2 className="font-bold text-[#3b2418] font-['Georgia'] text-lg mb-4">
            Delivery Information
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between gap-4 py-2 border-b border-[#f1ebe6]">
              <span className="text-sm text-gray-500">
                Phone
              </span>

              <span className="text-sm font-semibold text-[#3b2418] text-right">
                {formData.phone ||
                  "Not added"}
              </span>
            </div>

            <div className="flex justify-between gap-4 py-2 border-b border-[#f1ebe6]">
              <span className="text-sm text-gray-500">
                Country
              </span>

              <span className="text-sm font-semibold text-[#3b2418] text-right">
                {formData.country ||
                  "Not added"}
              </span>
            </div>

            <div className="flex justify-between gap-4 py-2 border-b border-[#f1ebe6]">
              <span className="text-sm text-gray-500">
                State
              </span>

              <span className="text-sm font-semibold text-[#3b2418] text-right">
                {formData.state ||
                  "Not added"}
              </span>
            </div>

            <div className="flex justify-between gap-4 py-2 border-b border-[#f1ebe6]">
              <span className="text-sm text-gray-500">
                Capital
              </span>

              <span className="text-sm font-semibold text-[#3b2418] text-right">
                {formData.capital ||
                  "Not added"}
              </span>
            </div>

      
            <div className="flex justify-between gap-4 py-2 border-b border-[#f1ebe6]">
              <span className="text-sm text-gray-500">
                Delivery
              </span>

              <span className="text-sm font-semibold text-[#3b2418] text-right">
                {formData.address ||
                  "Not added"}
              </span>
            </div>

          </div>
        </div>

        {/* ACCOUNT INFORMATION */}

        <div className="bg-white rounded-2xl shadow-sm border border-[#eadfd6] p-6 mb-6">

          <div className="flex justify-between items-center py-3 border-b border-[#f1ebe6]">

            <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
              <Shield className="w-4 h-4" />

              Sign-in Method
            </span>

            <span className="text-sm font-semibold text-[#3b2418] capitalize">
              {user.authProvider}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">

            <span className="text-sm text-gray-500 font-medium">
              Member Since
            </span>

            <span className="text-sm font-semibold text-[#3b2418]">
              {new Date(
                user.createdAt
              ).toLocaleDateString(
                "en-NG",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </span>
          </div>

        </div>

        {/* ACTIONS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          <Link
            to="/menu"
            className="flex items-center justify-center gap-2 bg-linear-to-r from-[#5a3825] to-[#8b5e3c] text-white py-3 px-6 rounded-xl font-semibold text-sm shadow-sm"
          >
            <ShoppingBag className="w-5 h-5" />

            Browse Menu
          </Link>

          <button
            onClick={
              handleLogout
            }
            className="flex items-center justify-center gap-2 bg-white border-2 border-[#dcc9bb] text-[#7a4a2d] py-3 px-6 rounded-xl font-semibold text-sm"
          >
            <LogOut className="w-5 h-5" />

            Sign Out
          </button>

        </div>

        {/* BACK TO HOME */}

        <div className="text-center">

          <Link
            to="/"
            className="text-sm text-[#7a4a2d] hover:underline font-medium flex items-center justify-center gap-1"
          >
            <FontAwesomeIcon
              icon={faCrown}
              className="text-[#b8875c] text-xs"
            />

            Back to Kings Chops
          </Link>

        </div>

      </div>
    </div>
  );
}

export default ProfilePage;