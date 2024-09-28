import React, { useState, useEffect } from "react";
import DispatchLayout from "../Layout/DispatchLayout";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "./Modal";
import { message } from "antd";
import axios from "axios";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AddItems = () => {
  const navigate = useNavigate();
  const { enrollment } = useParams();
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState("");
  const [items, setItems] = useState([
    {
      sku: "",
      name: "",
      price: "",
      quantity: "",
      amazonOrderId: "",
      pincode: "",
      trackingId: "",
      shippingPartner: "",
      totalPrice: "",
      productAction: "Available", // Default value set to "Available"
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);

  const handlePayButtonClick = async () => {
    const finalAmount = calculateFinalAmount();

    const dataToSubmit = {
      items,
      finalAmount,
    };

    try {
      const response = await axios.post(
        `${backendUrl}/orders/paidOrder/${enrollment}`,
        dataToSubmit,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      console.log("Data successfully sent to the backend:", response.data);
      message.success("Items successfully saved!");
      navigate("/dispatch-dash");
    } catch (error) {
      console.error("Error submitting data:", error);
      message.error("Failed to save items. Please try again.");
    }
  };

  // Fetch products from backend
  const getProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/products/getall`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getUserData = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/user/specific/${enrollment}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    getProducts();
    getUserData();
  }, []);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...items];
    updatedItems[index][name] = value;

    if (name === "sku") {
      const product = products.find((prod) => prod.sku === value);
      if (product) {
        updatedItems[index].name = product.name;
        updatedItems[index].price = product.price;
      } else {
        updatedItems[index].name = "";
        updatedItems[index].price = "";
      }
    }

    // Calculate total price for the item
    if (name === "quantity" || name === "price") {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const price = parseFloat(updatedItems[index].price) || 0;
      updatedItems[index].totalPrice = (quantity * price).toFixed(2);
    }

    // Handle custom partner logic
    if (name === "shippingPartner" && value !== "Custom") {
      updatedItems[index].customPartner = "";
    }

    setItems(updatedItems);
  };

  const calculateFinalAmount = () => {
    const subtotal = items.reduce(
      (total, item) => total + parseFloat(item.totalPrice || 0),
      0
    );

    let gst = 0;
    let scst = 0;

    // Check if the user is from the same state (Rajasthan in this case)
    if (userData.state === "Rajsthan") {
      gst = (subtotal * 9) / 100; // 9% GST
      scst = (subtotal * 9) / 100; // 9% SCST
    } else {
      gst = (subtotal * 18) / 100; // 18% GST for other states
    }

    const totalAmount = subtotal + gst + scst;
    return totalAmount.toFixed(2); // Return total amount including taxes
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        sku: "",
        name: "",
        price: "",
        quantity: "",
        amazonOrderId: "",
        pincode: "",
        trackingId: "",
        shippingPartner: "",
        customPartner: "",
        totalPrice: "",
        productAction: "Available", // Default value set to "Available"
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalAmount = calculateFinalAmount();

    const dataToSubmit = {
      items,
      finalAmount,
    };

    console.log(dataToSubmit);

    try {
      console.log(dataToSubmit);
      const response = await axios.post(
        `${backendUrl}/orders/${enrollment}`,
        dataToSubmit,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      console.log("Data successfully sent to the backend:", response.data);
      message.success("Items successfully saved!");
      navigate("/dispatch-dash");
    } catch (error) {
      console.error("Error submitting data:", error);
      message.error("Failed to save items. Please try again.");
    }
  };

  const openModal = (index) => {
    setCurrentIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentIndex(null);
  };

  const handleCustomSubmit = (customPartner) => {
    const updatedItems = [...items];
    updatedItems[currentIndex].shippingPartner = customPartner;
    updatedItems[currentIndex].customPartner = customPartner;
    setItems(updatedItems);
    closeModal();
  };

  return (
    <DispatchLayout>
      <main className="max-w-6xl mx-auto bg-white shadow-md rounded-md text-black">
        <h1 className="text-lg font-bold mb-6 text-center underline">
          Add Items for Order: {enrollment}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-md shadow-md mb-6"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amazon Order ID
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    PinCode
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Shipping Partner
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tracking ID
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product Action
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100 transition duration-300 ease-in-out"
                  >
                    <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">
                      <select
                        name="sku"
                        value={item.sku}
                        onChange={(e) => handleChange(index, e)}
                        className="w-30 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="">Select SKU</option>
                        {products.map((product) => (
                          <option key={product.sku} value={product.sku}>
                            {product.sku}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        name="name"
                        value={item.name}
                        readOnly
                        className="w-30 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        name="price"
                        value={item.price}
                        readOnly
                        className="w-20 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleChange(index, e)}
                        className="w-20 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        name="amazonOrderId"
                        value={item.amazonOrderId}
                        onChange={(e) => handleChange(index, e)}
                        className="w-30 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        name="pincode"
                        value={item.pincode}
                        onChange={(e) => handleChange(index, e)}
                        className="w-30 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <select
                        name="shippingPartner"
                        value={item.shippingPartner}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(index, e);
                          if (value === "Custom") {
                            openModal(index);
                          }
                        }}
                        className="w-30 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="">Select Shipping Partner</option>
                        <option value="DTDC">DTDC</option>
                        <option value="Tirupati">Tirupati</option>
                        <option value="Maruti">Maruti</option>
                        <option value="Delivery">Delivery</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        name="trackingId"
                        value={item.trackingId}
                        onChange={(e) => handleChange(index, e)}
                        className="w-25 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        name="totalPrice"
                        value={item.totalPrice}
                        readOnly
                        className="w-20 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <select
                        name="productAction"
                        value={item.productAction || "Available"} // Default to "Available"
                        onChange={(e) => handleChange(index, e)}
                        className="w-30 py-1 px-3 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="Available">Available</option>
                        <option value="Product not available">
                          Product not available
                        </option>
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-red-200"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleAddRow}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-200"
            >
              Add Row
            </button>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-200"
              >
                Hold money issue
              </button>

              {parseFloat(calculateFinalAmount()) >
              parseFloat(userData?.amount || 0) ? (
                <button
                  className="bg-red-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed relative group"
                  disabled
                >
                  Pay & Order
                  <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Insufficient account balance
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePayButtonClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-200"
                >
                  Pay & Order
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            {userData.state === "Rajsthan" ? (
              <div>
                GST: ₹
                {(
                  (calculateFinalAmount() -
                    items.reduce(
                      (total, item) => total + parseFloat(item.totalPrice || 0),
                      0
                    )) /
                  2
                ).toFixed(2)}{" "}
                (9%) <br />
                IGST: ₹
                {(
                  (calculateFinalAmount() -
                    items.reduce(
                      (total, item) => total + parseFloat(item.totalPrice || 0),
                      0
                    )) /
                  2
                ).toFixed(2)}{" "}
                (9%)
              </div>
            ) : (
              <div>
                GST: ₹
                {(
                  (calculateFinalAmount() -
                    items.reduce(
                      (total, item) => total + parseFloat(item.totalPrice || 0),
                      0
                    )) *
                  0.18
                ).toFixed(2)}{" "}
                (18%)
              </div>
            )}
            <h2 className="text-xl font-bold">
              Payable amount: ₹{calculateFinalAmount()}
            </h2>
            <h2 className="text-x1 font-bold">
              Account Balance: ₹{userData?.amount?.toLocaleString("en-IN")}
            </h2>
          </div>
        </form>
      </main>

      {modalVisible && (
        <Modal
          visible={modalVisible}
          onClose={closeModal}
          onSubmit={handleCustomSubmit}
        />
      )}
    </DispatchLayout>
  );
};

export default AddItems;
