import React, { useEffect, useState } from "react";
import DispatchLayout from "../Layout/DispatchLayout";
import { Link } from "react-router-dom";
import { Modal, Button, Table, message, Select, Radio, Input } from "antd";
import axios from "axios";
import moment from "moment"; // Make sure to install moment.js via npm or yarn

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const { Option } = Select;

const DispatchDash = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [selectedOrderAmount, setSelectedOrderAmount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState(""); // Initialize with empty string for no filter
  const [editingItem, setEditingItem] = useState(null); // Track the editing item
  const [editValues, setEditValues] = useState({}); // Store edit values for the item

  // Fetch orders from backend
  const getOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/orders/getallorders`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setOrders(response.data.orders);
      setFilteredOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders. Please try again.");
    }
  };
  const handleDeleteclick = async (orderItems, finalAmount, orderId) => {
    console.log("kyu click kiya");
    console.log(orderId, finalAmount);

    try {
      const response = await axios.delete(
        `${backendUrl}/orders/delete/${orderId}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Order deleted successfully!");
      getOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      message.error("Could not delete order, Please try again");
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const filterOrders = () => {
    let filtered = [...orders];

    // Apply Payment Status Filter
    if (paymentStatusFilter !== "") {
      const isPaid = paymentStatusFilter === "true";
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => order.paymentStatus === isPaid),
        }))
        .filter((user) => user.orders.length > 0);
    }

    // Apply Time Filter
    if (timeFilter !== "") {
      const now = moment();
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => {
            const orderDate = moment(order.createdAt);
            switch (timeFilter) {
              case "today":
                return orderDate.isSame(now, "day");
              case "week":
                return orderDate.isSame(now, "week");
              case "month":
                return orderDate.isSame(now, "month");
              case "year":
                return orderDate.isSame(now, "year");
              default:
                return true;
            }
          }),
        }))
        .filter((user) => user.orders.length > 0);
    }

    setFilteredOrders(filtered);
  };
  const columns = [
    {
      title: <span className="text-xs">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Enrollment No.</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Amazon Order Id</span>,
      dataIndex: "amazonOrderId",
      key: "amazonOrderId",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Manager</span>,
      dataIndex: "manager",
      key: "manager",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Delivery Partner</span>,
      dataIndex: "shippingPartner",
      key: "shippingPartner",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Tracking Id</span>,
      dataIndex: "trackingId",
      key: "trackingId",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">SKU</span>,
      dataIndex: "sku",
      key: "sku",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Pincode</span>,
      dataIndex: "pincode",
      key: "pincode",
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: <span className="text-xs">Amount</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text) => <span className="text-xs">₹ {text}</span>,
    },
    {
      title: <span className="text-xs">Product Status</span>,
      dataIndex: "items",
      key: "productAction",
      render: (items) => {
        const allAvailable = items.every(
          (item) => item.productAction === "Available"
        );
        return allAvailable ? (
          <span className="text-xs text-green-500">Available</span>
        ) : (
          <span className="text-xs text-red-500">Unavailable</span>
        );
      },
    },
    {
      title: <span className="text-xs">Action</span>,
      key: "action",
      render: (_, record) => (
        <div className="text-xs flex gap-2">
          <Button
            type="primary"
            className="text-xs"
            onClick={() =>
              handleRowClick(record.items, record.finalAmount, record._id)
            }
            style={{ marginRight: "10px" }}
          >
            View & Edit
          </Button>
          {!record.paymentStatus ? (
            <Button
              type="primary"
              className="text-xs"
              onClick={() =>
                handlePaymentClick(
                  record.finalAmount,
                  record._id,
                  record.enrollment
                )
              }
            >
              Pay Now
            </Button>
          ) : (
            <Button
              type="primary"
              className="text-xs"
              disabled={true}
              style={{
                background: "rgb(40,167,69)",
                paddingLeft: "26px",
                paddingRight: "26px",
                color: "white",
              }}
            >
              Done
            </Button>
          )}

          <Button
            type="primary"
            className="text-xs"
            onClick={() =>
              handleDeleteclick(record.items, record.finalAmount, record._id)
            }
            style={{ marginRight: "10px", background: "red" }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];
  const dataSource = filteredOrders
    .flatMap((user) =>
      user.orders.map((order) => ({
        key: order._id,
        name: user.name,
        enrollment: user.enrollment,
        amazonOrderId: order.items[0]?.amazonOrderId || "N/A",
        manager: user.manager,
        shippingPartner: order.items[0]?.shippingPartner || "N/A",
        trackingId: order.items[0]?.trackingId || "N/A",
        sku: order.items[0]?.sku || "N/A",
        pincode: order.items[0]?.pincode || "N/A",
        address: user.address,
        finalAmount: order.finalAmount,
        paymentStatus: order.paymentStatus,
        items: order.items,
        _id: order._id,
        createdAt: order.createdAt,
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Trigger filtering whenever filters or orders change
  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatusFilter, timeFilter, orders]);

  // Handlers for filters
  const handlePaymentStatusFilter = (value) => {
    setPaymentStatusFilter(value);
  };

  const handleTimeFilter = (e) => {
    setTimeFilter(e.target.value);
  };

  const handleDeleteClick = async (orderItems, finalAmount, orderId) => {
    try {
      await axios.delete(`${backendUrl}/orders/delete/${orderId}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      message.success("Order deleted successfully!");
      getOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      message.error("Could not delete order, Please try again");
    }
  };

  // Handlers for modal and actions
  const handleRowClick = (orderItems, finalAmount, orderId) => {
    setSelectedOrderItems(orderItems);
    setSelectedOrderAmount(finalAmount);
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrderItems([]);
    setSelectedOrderAmount(0);
    setSelectedOrderId("");
    setEditingItem(null); // Reset editing item
  };

  const handlePaymentClick = async (amount, id, enrollment) => {
    try {
      await axios.post(
        `${backendUrl}/orders/pay/${amount}`,
        { enrollment, id },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Payment completed successfully!");
      getOrders();
    } catch (error) {
      console.error("Error initiating payment:", error);
      message.error("Insufficient user amount. Please try again.");
    }
  };

  const handleMarkAvailableClick = async (id) => {
    try {
      await axios.put(
        `${backendUrl}/orders/markavailable/${id}`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Item marked as available successfully!");
      getOrders();
    } catch (error) {
      console.error("Error marking item as available:", error);
      message.error("Failed to mark item as available. Please try again.");
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item._id);
    // Populate the form with the item details
    setEditValues({
      amazonOrderId: item.amazonOrderId,
      trackingId: item.trackingId,
      sku: item.sku,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      pincode: item.pincode,
      shippingPartner: item.shippingPartner,
      totalPrice: item.totalPrice,
    });
  };

  // Save changes to the edited item
  const handleSaveClick = async () => {
    try {
      await axios.put(
        `${backendUrl}/orders/update/${editingItem}`,
        editValues,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("Order updated successfully!");
      getOrders();
      setEditingItem(null); // Exit editing mode
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("Failed to update order. Please try again.");
    }
  };

  const handleChange = (e) => {
    setEditValues({
      ...editValues,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <DispatchLayout>
      <div className="relative max-w-6xl mx-auto pb-20">
        <h1 className="text-xl font-semibold text-center text-gray-600 mb-4">
          Dispatch Dashboard
        </h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center justify-between space-x-4">
            {" "}
            <div className="text-sm">
              <label htmlFor="paymentStatus">Payment Status: </label>
              <Select
                id="paymentStatus"
                value={paymentStatusFilter}
                style={{ width: 200 }}
                onChange={handlePaymentStatusFilter}
                className="text-xs"
                placeholder="Select Status"
                allowClear
              >
                <Option value="true" className="text-xs">
                  Paid
                </Option>
                <Option value="false" className="text-xs">
                  Unpaid
                </Option>
              </Select>
            </div>
            <div>
              <Link to="/create-order">
                <Button type="primary" className="text-xs ">
                  Create Order
                </Button>
              </Link>
            </div>
            {/* Time Filter */}
            <div className="text-xs">
              <Radio.Group
                onChange={handleTimeFilter}
                value={timeFilter}
                buttonStyle="solid"
              >
                <Radio.Button value="today">Today</Radio.Button>
                <Radio.Button value="week">This Week</Radio.Button>
                <Radio.Button value="month">This Month</Radio.Button>
                <Radio.Button value="year">This Year</Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto mb-16 text-xs">
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 10 }}
            rowKey={(record) => record._id}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        title="Order Details"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
          editingItem && (
            <Button key="save" type="primary" onClick={handleSaveClick}>
              Save
            </Button>
          ),
        ]}
      >
        <ul>
          {selectedOrderItems.map((item, index) => (
            <li key={index} className="text-sm pb-6">
              {editingItem === item._id ? (
                <>
                  <label>
                    <strong>Amazon Order ID:</strong>
                    <Input
                      name="amazonOrderId"
                      value={editValues.amazonOrderId || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <label>
                    <strong>Tracking ID:</strong>
                    <Input
                      name="trackingId"
                      value={editValues.trackingId || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <label>
                    <strong>SKU:</strong>
                    <Input name="sku" value={editValues.sku || ""} />
                  </label>
                  <br />
                  <label>
                    <strong>Name:</strong>
                    <Input name="name" value={editValues.name || ""} />
                  </label>
                  <br />
                  <label>
                    <strong>Price:</strong>
                    <Input
                      name="price"
                      value={editValues.price || ""}
                      type="number"
                    />
                  </label>
                  <br />
                  <label>
                    <strong>Quantity:</strong>
                    <Input
                      name="quantity"
                      value={editValues.quantity || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <label>
                    <strong>Pincode:</strong>
                    <Input
                      name="pincode"
                      value={editValues.pincode || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <label>
                    <strong>Shipping Partner:</strong>
                    <Input
                      name="shippingPartner"
                      value={editValues.shippingPartner || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <br />
                  <label>
                    <strong>Total Price:</strong>
                    <Input
                      name="totalPrice"
                      value={editValues.totalPrice || ""}
                      type="number"
                    />
                  </label>
                </>
              ) : (
                <>
                  <strong>Amazon Order ID:</strong> {item.amazonOrderId}
                  <br />
                  <strong>Tracking ID:</strong> {item.trackingId}
                  <br />
                  <strong>SKU:</strong> {item.sku}
                  <br />
                  <strong>Name:</strong> {item.name}
                  <br />
                  <strong>Price:</strong> {item.price}
                  <br />
                  <strong>Quantity:</strong> {item.quantity}
                  <br />
                  <strong>Pincode:</strong> {item.pincode}
                  <br />
                  <strong>Delivery Partner:</strong> {item.shippingPartner}
                  <br />
                  <strong>Total Price:</strong> {item.totalPrice}
                  <br />
                  <Button
                    type="primary"
                    onClick={() => handleEditClick(item)}
                    style={{ marginTop: "10px" }}
                  >
                    Edit
                  </Button>
                  {item.productAction !== "Available" && (
                    <Button
                      type="primary"
                      className="text-xs mt-2 ml-5"
                      onClick={() => handleMarkAvailableClick(item._id)}
                    >
                      Mark Available
                    </Button>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </Modal>
    </DispatchLayout>
  );
};

export default DispatchDash;
