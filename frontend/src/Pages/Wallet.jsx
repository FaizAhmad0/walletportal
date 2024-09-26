import React, { useEffect, useState, useRef } from "react";
import UserLayout from "../Layout/UserLayout";
import axios from "axios";
import { Input, message } from "antd";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const MoneyCounter = ({ amount }) => {
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // duration of animation in milliseconds
    const increment = amount / (duration / 16); // Approx. 60 FPS

    const animateCount = () => {
      start += increment;
      if (start < amount) {
        setDisplayAmount(start);
        requestAnimationFrame(animateCount);
      } else {
        setDisplayAmount(amount);
      }
    };

    animateCount();
  }, [amount]);

  return (
    <p className="text-3xl font-bold text-white">
      ₹ {displayAmount.toLocaleString("en-IN")}.00
    </p>
  );
};

const Wallet = () => {
  const [amount, setAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState("");
  const transactionRef = useRef(null);

  const handlePredefinedAmountClick = (amount) => {
    setAmount(amount);
  };

  function formatDate(createdAt) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(createdAt));
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddBalance = async () => {
    if (!amount) {
      message.error("Please enter an amount!");
      return;
    }

    const id = localStorage.getItem("id");
    try {
      const response = await axios.post(
        `${backendUrl}/wallet/add-balance`,
        { userId: id, amount: Number(amount) },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Balance added successfully!");
      closeModal();
      setAmount("");
      if (response.data.paymentURL) {
        window.open(response.data.paymentURL, "_blank");
      }
      getUserData();
      window.location.reload();
    } catch (error) {
      console.error("Error adding balance:", error);
      message.error("Error adding balance, please try again.");
    }
  };

  const getUserData = async () => {
    const id = localStorage.getItem("id");
    try {
      const response = await axios.get(`${backendUrl}/user/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const scrollToTransactions = () => {
    if (transactionRef.current) {
      transactionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto p-6 pt-0">
        <div className="bg-purple-600 text-white p-4 rounded-lg flex justify-between items-center mb-6 mt-10">
          <div>
            <h3 className="text-lg font-bold">Wallet Balance</h3>
            {userData?.user?.amount !== undefined && (
              <MoneyCounter amount={userData.user.amount} />
            )}
            <button
              onClick={scrollToTransactions}
              className="text-sm underline"
            >
              View Transactions
            </button>
          </div>
          <div className="text-center">
            <button
              onClick={openModal}
              className="bg-purple-200 text-black py-2 px-4 rounded-lg text-center hover:bg-purple-300 transition duration-300 transform hover:scale-105"
            >
              <div className="flex flex-col items-center">
                <span className="text-xl">➕</span>
                <span>Add Balance</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mb-6 text-black">
          <h3 className="text-lg font-bold mb-4">Add Balance:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => handlePredefinedAmountClick("2000")}
              className="border-2 border-purple-600 py-2 px-4 rounded-lg text-center hover:bg-purple-100 transition duration-300 transform hover:scale-105"
            >
              ₹2,000.00
            </button>
            <button
              onClick={() => handlePredefinedAmountClick("5000")}
              className="border-2 border-purple-600 py-2 px-4 rounded-lg text-center hover:bg-purple-100 transition duration-300 transform hover:scale-105"
            >
              ₹5,000.00
            </button>
            <button
              onClick={() => handlePredefinedAmountClick("10000")}
              className="border-2 border-purple-600 py-2 px-4 rounded-lg text-center hover:bg-purple-100 transition duration-300 transform hover:scale-105"
            >
              ₹10,000.00
            </button>
          </div>

          <label className="block mb-2 font-semibold">Enter Amount (₹):</label>
          <Input
            type="number"
            placeholder="Enter custom amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg w-full mb-4"
            required
          />
          <button
            onClick={handleAddBalance}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 transform hover:scale-105"
          >
            Proceed
          </button>
        </div>

        <div
          id="transactionHistory"
          className="bg-white p-4 rounded-lg shadow-md text-black"
          ref={transactionRef}
        >
          <h3 className="text-lg font-bold mb-4">Recent Transactions:</h3>
          <ul className="space-y-2">
            {userData.user?.transactions
              ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((transaction, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border-b border-gray-200 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {transaction.description || "No description available"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <p
                    className={`font-bold ${
                      transaction.credit ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <strong>
                      ₹{transaction.amount?.toLocaleString("en-IN")}
                    </strong>
                  </p>
                </li>
              ))}
          </ul>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">Add Balance</h3>
              <label className="block mb-2 font-semibold">
                Enter Amount (₹):
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg w-full mb-4"
                required
              />
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 transform hover:scale-105"
                onClick={handleAddBalance}
              >
                Proceed
              </button>
              <button
                className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 transform hover:scale-105"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Wallet;
