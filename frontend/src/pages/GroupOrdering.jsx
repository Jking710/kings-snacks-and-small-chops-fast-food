import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Plus,
  Minus,
  Trash2,
  LogOut,
  RefreshCw,
} from "lucide-react";

import { useCart } from "../CartContext.jsx";
import { useAuth } from "../AuthContext.jsx";
import menuItems from "../data/menuItems.js";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function GroupOrdering() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [mode, setMode] = useState("create");

  const [groupName, setGroupName] = useState("");
  const [groupCodeInput, setGroupCodeInput] = useState("");

  const [group, setGroup] = useState(null);
  const [groupTotal, setGroupTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const request = async (url, options = {}) => {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      setError("Enter a name for your group.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await request("/group-orders/create", {
        method: "POST",
        body: JSON.stringify({
          groupName,
        }),
      });

      setGroup(data.group);
      setGroupTotal(0);
      setSuccess("Group created successfully.");
      setGroupName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!groupCodeInput.trim()) {
      setError("Enter a group code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await request("/group-orders/join", {
        method: "POST",
        body: JSON.stringify({
          groupCode: groupCodeInput.trim().toUpperCase(),
        }),
      });

      setGroup(data.group);
      setGroupTotal(calculateTotal(data.group));
      setSuccess(data.message);
      setGroupCodeInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const refreshGroup = useCallback(async () => {
  if (!group?.groupCode) return;

  try {
    setRefreshing(true);
    setError("");

    const data = await request(
      `/group-orders/${group.groupCode}`
    );

    setGroup(data.group);
    setGroupTotal(data.total);
  } catch (err) {
    setError(err.message);
  } finally {
    setRefreshing(false);
  }
}, [group?.groupCode]);

useEffect(() => {
  if (!group?.groupCode) return;

  const interval = setInterval(() => {
    refreshGroup();
  }, 5000);

  return () => clearInterval(interval);
}, [group?.groupCode, refreshGroup]);

  const calculateTotal = (currentGroup) => {
    return currentGroup.members.reduce((total, member) => {
      return (
        total +
        member.items.reduce(
          (memberTotal, item) =>
            memberTotal + item.price * item.quantity,
          0
        )
      );
    }, 0);
  };

  const addSnack = async (item) => {
    if (!group?.groupCode) return;

    try {
      setError("");

      const data = await request(
        `/group-orders/${group.groupCode}/items`,
        {
          method: "POST",
          body: JSON.stringify({
            id: item.id,
            name: item.name,
            price: item.price,
            img: item.img,
            quantity: 1,
          }),
        }
      );

      setGroup(data.group);
      setGroupTotal(data.total);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!group?.groupCode) return;

    try {
      const data = await request(
        `/group-orders/${group.groupCode}/items/${itemId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      setGroup(data.group);
      setGroupTotal(data.total);
    } catch (err) {
      setError(err.message);
    }
  };

  const removeSnack = async (itemId) => {
    if (!group?.groupCode) return;

    try {
      const data = await request(
        `/group-orders/${group.groupCode}/items/${itemId}`,
        {
          method: "DELETE",
        }
      );

      setGroup(data.group);
      setGroupTotal(data.total);
    } catch (err) {
      setError(err.message);
    }
  };

  const leaveGroup = async () => {
    if (!group?.groupCode) return;

    try {
      setLoading(true);

      await request(
        `/group-orders/${group.groupCode}/leave`,
        {
          method: "DELETE",
        }
      );

      setGroup(null);
      setGroupTotal(0);
      setSuccess("You left the group.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyGroupCode = async () => {
    if (!group?.groupCode) return;

    await navigator.clipboard.writeText(group.groupCode);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const addGroupItemsToCart = () => {
    if (!group) return;

    group.members.forEach((member) => {
      member.items.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            img: item.img,
          });
        }
      });
    });

    navigate("/cart");
  };

  const currentMember = group?.members.find(
    (member) =>
      member.user?._id === user?._id ||
      member.user === user?._id
  );

  const memberItems = currentMember?.items || [];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-linear-to-br from-[#7c2d12] via-[#c2410c] to-[#9f1239] text-white">
        <div className="max-w-7xl mx-auto px-5 py-10">

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>

            <div>
              <p className="text-orange-100 text-sm uppercase tracking-widest font-semibold">
                Order together
              </p>

              <h1 className="text-4xl font-bold font-['Georgia']">
                Group Ordering
              </h1>
            </div>
          </div>

          <p className="text-orange-50 mt-4 max-w-2xl">
            Order snacks together with friends, classmates or family.
            Everyone chooses their own snacks and everything appears in one
            shared order.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-10">

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {!group ? (
          <div className="max-w-xl mx-auto">

            <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-7">

              <div className="text-center mb-7">
                <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 font-['Georgia'] mt-4">
                  Order With Your Group
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  Create a new group or join a group using a code.
                </p>
              </div>

              <div className="flex bg-orange-50 rounded-xl p-1 mb-6">
                <button
                  onClick={() => {
                    setMode("create");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                    mode === "create"
                      ? "bg-orange-600 text-white"
                      : "text-orange-700"
                  }`}
                >
                  Create Group
                </button>

                <button
                  onClick={() => {
                    setMode("join");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                    mode === "join"
                      ? "bg-orange-600 text-white"
                      : "text-orange-700"
                  }`}
                >
                  Join Group
                </button>
              </div>

              {mode === "create" ? (
                <>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Group Name
                  </label>

                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Class Lunch"
                    maxLength={60}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                  />

                  <button
                    onClick={createGroup}
                    disabled={loading}
                    className="w-full mt-5 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 disabled:bg-gray-300 cursor-pointer"
                  >
                    {loading ? "Creating..." : "Create Group"}
                  </button>
                </>
              ) : (
                <>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Group Code
                  </label>

                  <input
                    type="text"
                    value={groupCodeInput}
                    onChange={(e) =>
                      setGroupCodeInput(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. A4F92B"
                    maxLength={6}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 uppercase tracking-widest"
                  />

                  <button
                    onClick={joinGroup}
                    disabled={loading}
                    className="w-full mt-5 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 disabled:bg-gray-300 cursor-pointer"
                  >
                    {loading ? "Joining..." : "Join Group"}
                  </button>
                </>
              )}

            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-6 mb-8">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>
                  <p className="text-sm text-gray-500">
                    Group Order
                  </p>

                  <h2 className="text-2xl font-bold text-gray-800 font-['Georgia']">
                    {group.groupName}
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    {group.members.length}{" "}
                    {group.members.length === 1 ? "member" : "members"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3">
                    <p className="text-xs text-gray-500">
                      Group Code
                    </p>

                    <p className="font-bold text-orange-600 tracking-widest">
                      {group.groupCode}
                    </p>
                  </div>

                  <button
                    onClick={copyGroupCode}
                    className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center hover:bg-orange-700 cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={refreshGroup}
                    disabled={refreshing}
                    className="w-12 h-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>

                  {group.creator?._id !== user?._id && (
                    <button
                      onClick={leaveGroup}
                      className="h-12 px-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 hover:bg-red-100 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave
                    </button>
                  )}

                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2">

                <div className="mb-5">
                  <p className="text-orange-600 text-sm font-semibold uppercase tracking-wider">
                    Choose your snacks
                  </p>

                  <h2 className="text-3xl font-bold text-gray-800 font-['Georgia']">
                    Add Snacks
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-32 object-cover"
                      />

                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 text-sm">
                          {item.name}
                        </h3>

                        <p className="text-orange-600 font-bold mt-1">
                          ₦{item.price.toLocaleString()}
                        </p>

                        <button
                          onClick={() => addSnack(item)}
                          className="w-full mt-3 bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  ))}

                </div>
              </div>

              <div>

                <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-6 sticky top-24">

                  <div className="flex items-center justify-between mb-5">

                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-600" />

                      <h3 className="text-xl font-bold text-gray-800 font-['Georgia']">
                        Members
                      </h3>
                    </div>

                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                      {group.members.length}
                    </span>

                  </div>

                  <div className="space-y-3 mb-6">
                    {group.members.map((member) => {
                      const memberTotal = member.items.reduce(
                        (sum, item) =>
                          sum + item.price * item.quantity,
                        0
                      );

                      return (
                        <div
                          key={member.user?._id || member.user}
                          className="bg-gray-50 rounded-xl p-3"
                        >
                          <div className="flex items-center justify-between">

                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {member.firstName} {member.lastName}

                                {member.user?._id === user?._id && (
                                  <span className="text-orange-600 ml-1">
                                    (You)
                                  </span>
                                )}
                              </p>

                              <p className="text-xs text-gray-400">
                                {member.items.length}{" "}
                                {member.items.length === 1
                                  ? "item"
                                  : "items"}
                              </p>
                            </div>

                            <span className="font-bold text-orange-600 text-sm">
                              ₦{memberTotal.toLocaleString()}
                            </span>

                          </div>

                          {member.items.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {member.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between text-xs text-gray-500"
                                >
                                  <span>
                                    {item.name} ×{item.quantity}
                                  </span>

                                  <span>
                                    ₦
                                    {(
                                      item.price * item.quantity
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-100 pt-5">

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-600">
                        Group Total
                      </span>

                      <span className="text-2xl font-bold text-orange-600">
                        ₦{groupTotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={addGroupItemsToCart}
                      disabled={groupTotal === 0}
                      className="w-full mt-5 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 disabled:bg-gray-300 cursor-pointer"
                    >
                      Add Group Order to Cart
                    </button>

                  </div>

                  <div className="mt-5 bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-orange-700">
                      Share the group code with your friends. They need to
                      log in before joining.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default GroupOrdering;