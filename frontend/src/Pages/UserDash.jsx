import React, { useEffect, useState } from "react";
import { Button, message, Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import UserLayout from "../Layout/UserLayout";
import axios from "axios";
import "jspdf-autotable";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const UserDash = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [selectedOrderAmount, setSelectedOrderAmount] = useState(0);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [orderToPay, setOrderToPay] = useState(null);

  const { message: successMessage } = location.state || {};

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

  function formatDate(createdAt) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(createdAt));
  }

  const handleViewClick = (orderItems, finalAmount) => {
    setSelectedOrderItems(orderItems);
    setSelectedOrderAmount(finalAmount);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrderItems([]);
    setSelectedOrderAmount(0);
  };

  const generateInvoice = (order) => {
    const customer = {
      email: userData?.user?.email,
      address: userData?.user?.address,
      city: userData?.user?.city,
      state: userData?.user?.state,
      pincode: userData?.user?.pincode,
      mobile: userData?.user?.mobile,
      name: userData?.user?.name,
      country:userData?.user?.country,
      gst:userData?.user?.gst,
    };

    navigate("/invoice", { state: { orderId: order._id, customer } });
  };

  const handleRechargeNowClick = () => {
    navigate("/wallet");
  };

  const handlePaymentClick = (order) => {
    setOrderToPay(order);
    setIsPaymentModalVisible(true);
  };

  const handlePaymentConfirm = async () => {
    const userId = localStorage.getItem("id");
    if (orderToPay) {
      try {
        await axios.post(
          `${backendUrl}/user/payorder`,
          { orderId: orderToPay._id, userId },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        message.success("Payment successful!");
        setIsPaymentModalVisible(false);
        getUserData(); // Refresh user data after payment
      } catch (error) {
        console.error("Error processing payment:", error);
        message.error("Payment failed!");
      }
    }
  };

  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
    getUserData();
  }, [successMessage, location, navigate]);

  return (
    <UserLayout>
      <div style={{ background: "#fff", borderRadius: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontWeight: "bold", fontSize: "20px" }}>
              {localStorage.getItem("name")}
            </h2>
            <p style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}>
              {userData?.user?.enrollment}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h3
              style={{
                margin: 0,
                fontWeight: "bold",
                fontSize: "large",
                animation: "upDown 2s ease-in-out infinite",
              }}
            >
              {userData?.user?.gms > 150000 ? (
                <>Tiar - Platinum</>
              ) : userData?.user?.gms > 100000 ? (
                <>Tiar - Gold</>
              ) : userData?.user?.gms > 55000 ? (
                <>Tiar - Silver</>
              ) : userData?.user?.gms > 35000 ? (
                <>Tiar - Bronze</>
              ) : (
                <></>
              )}

              <span role="img" aria-label="crown">
                👑
              </span>
            </h3>
          </div>

          <style>
            {`
                @keyframes upDown {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-5px);
                }
                }
            `}
          </style>

          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: 5, fontSize: "20px", fontWeight: "bold" }}>
              Rs : {userData?.user?.amount?.toLocaleString("en-IN")}.00
            </h1>
            <p
              style={{
                color: "#b076ff",
                fontSize: "18px",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              GMS: {userData?.user?.gms}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-black uppercase text-xs leading-normal h-8">
                <th className="py-3 px-4 text-left whitespace-nowrap border-b border-gray-200">
                  Order Id
                </th>
                <th className="py-3 px-4 text-left whitespace-nowrap border-b border-gray-200">
                  Amazon Order Id
                </th>
                <th className="py-3 px-4 text-left whitespace-nowrap border-b border-gray-200">
                  Date
                </th>

                <th className="py-3 px-4 text-left whitespace-nowrap border-b border-gray-200">
                  Total Price
                </th>
                <th className="py-3 px-4 text-left whitespace-nowrap border-b border-gray-200">
                  Delivery Partner
                </th>
                <th className="py-3 px-4 text-left whitespace-nowrap border-b border-gray-200">
                  Tracking ID
                </th>
                <th className="py-3 px-4 text-left whitespace-nowrap border-b border-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-900 text-xs font-light whitespace-nowrap leading-tight">
              {userData?.user?.orders
                ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort orders by date in descending order
                .map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-100 focus:outline-none focus:ring focus:ring-slate-200 transition duration-200"
                  >
                    <td className="py-3 px-4 border-b border-gray-200">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      {order.items[0]?.amazonOrderId}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="py-3 px-4 border-b border-gray-200">
                      ₹ {order.finalAmount}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      {order.items[0]?.shippingPartner}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      {order.items[0]?.trackingId}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 flex gap-2">
                      {order.paymentStatus ? (
                        <Button
                          style={{
                            width: "80px",
                            background: "green",
                            color: "white",
                          }}
                          className="mr-2 text-xs"
                          disabled
                        >
                          Done
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          className="mr-2 text-xs"
                          onClick={() => handlePaymentClick(order)}
                        >
                          Pay Now
                        </Button>
                      )}
                      <Button
                        className="mr-2 text-xs"
                        onClick={() =>
                          handleViewClick(order.items, order.finalAmount)
                        }
                      >
                        View
                      </Button>
                      <Button
                        className="mr-2 text-xs"
                        onClick={() => generateInvoice(order)}
                      >
                        Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title="Order Items"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button type="primary" key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        <ul className="p-5">
          {selectedOrderItems.map((item, index) => {
            const gstRate = 0.18;
            const itemTotal = item.price * item.quantity;
            const gstAmount = itemTotal * gstRate;
            const totalWithGst = itemTotal + gstAmount;

            return (
              <li key={index} className="pb-5">
                <p>
                  <strong>Product:</strong> {item.name}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Price:</strong> ₹ {item.price}
                </p>
                <p>
                  <strong>Total Price (before GST):</strong> ₹{" "}
                  {itemTotal.toFixed(2)}
                </p>
                <p>
                  <strong>GST (18%):</strong> ₹ {gstAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Total (including GST):</strong> ₹{" "}
                  {totalWithGst.toFixed(2)}
                </p>
                <hr />
              </li>
            );
          })}
        </ul>
        <p style={{ textAlign: "right", fontWeight: "bold" }}>
          Final Amount: Rs {selectedOrderAmount}
        </p>
      </Modal>

      <Modal
        title="Payment Confirmation"
        visible={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsPaymentModalVisible(false)}>
            Cancel
          </Button>,
          <Button type="primary" onClick={handleRechargeNowClick}>
            Recharge now
          </Button>,
          <Button
            key="pay"
            type="primary"
            onClick={handlePaymentConfirm}
            disabled={userData?.user?.amount < (orderToPay?.finalAmount || 0)}
          >
            Pay Now
          </Button>,
        ]}
      >
        <p>
          <strong>Order Amount:</strong> ₹ {orderToPay?.finalAmount}
        </p>
        <p>
          <strong>Your Amount:</strong> ₹ {userData?.user?.amount}
        </p>
        {userData?.user?.amount < (orderToPay?.finalAmount || 0) && (
          <p style={{ color: "red" }}>
            Insufficient funds to make this payment.
          </p>
        )}
      </Modal>
    </UserLayout>
  );
};

export default UserDash;
