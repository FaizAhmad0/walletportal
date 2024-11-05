import React, { useEffect, useState } from "react";
import axios from "axios";
import { DatePicker, Button, Radio, Table } from "antd"; // Import Ant Design DatePicker
import dayjs from "dayjs"; // For date formatting
import AdminLayout from "../Layout/AdminLayout";
import { FilterOutlined } from "@ant-design/icons";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AdminDetailsReporting = () => {
  const [userData, setUserData] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [productStatusFilter, setProductStatusFilter] = useState(null);

  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [holdMoneyIssueCount, setHoldMoneyIssueCount] = useState(0);
  const [productNotAvailableCount, setProductNotAvailableCount] = useState(0);
  const [totalOrdersHold, setTotalOrdersHold] = useState(0);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date
  const handleProductStatusFilter = (value) => {
    setProductStatusFilter(value);
  };
  // Fetch user data and orders from the backend
  const getUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getalluserss`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      const users = response.data.users || [];
      setUserData(users);

      let totalOrders = 0;
      let holdMoneyIssue = 0;
      let productNotAvailable = 0;
      let totalHoldOrders = 0;
      let allOrders = [];

      users.forEach((user) => {
        const orders = user.orders || [];
        totalOrders += orders.length;

        orders.forEach((order) => {
          let orderHasHold = false;
          allOrders.push(order); // Add all orders

          if (order.paymentStatus === false) {
            holdMoneyIssue += 1;
            orderHasHold = true;
          }

          const items = order.items || [];
          const productHold = items.some(
            (item) => item.productAction !== "Available"
          );

          if (productHold) {
            productNotAvailable += 1;
            orderHasHold = true;
          }

          if (orderHasHold) {
            totalHoldOrders += 1;
          }
        });
      });

      setTotalOrdersCount(totalOrders);
      setHoldMoneyIssueCount(holdMoneyIssue);
      setProductNotAvailableCount(productNotAvailable);
      setTotalOrdersHold(totalHoldOrders);
      setFilteredOrders(allOrders); // Display all orders initially
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getUserData(); // Fetch data when the component is mounted
  }, []);

  const filterOrders = (type) => {
    setFilterType(type); // Set the filterType state

    let filtered = [];

    userData.forEach((user) => {
      const orders = user.orders || [];
      orders.forEach((order) => {
        // Check if the date matches if a date is selected
        if (selectedDate) {
          const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD");
          if (orderDate !== selectedDate) return;
        }

        // Filter based on the button clicked
        if (type === "paymentStatus" && order.paymentStatus === false) {
          filtered.push(order);
        } else if (
          type === "productNotAvailable" &&
          order.items.some((item) => item.productAction !== "Available")
        ) {
          filtered.push(order);
        }
      });
    });

    setFilteredOrders(filtered);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? date.format("YYYY-MM-DD") : null);

    let filtered = [];
    let moneyIssueCount = 0;
    let productNotAvailableCount = 0;
    let totalHoldOrders = 0;
    let totalOrders = 0;

    userData.forEach((user) => {
      const orders = user.orders || [];

      orders.forEach((order) => {
        // Filter by date
        if (date) {
          const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD");
          if (orderDate !== date.format("YYYY-MM-DD")) {
            return;
          }
        }

        totalOrders += 1; // Count total orders for the selected date
        let orderHasHold = false;

        if (order.paymentStatus === false) {
          moneyIssueCount += 1; // Count hold money issues
          orderHasHold = true;
        }

        const productHold = order.items.some(
          (item) => item.productAction !== "Available"
        );
        if (productHold) {
          productNotAvailableCount += 1; // Count product not available holds
          orderHasHold = true;
        }

        if (orderHasHold) {
          totalHoldOrders += 1; // Count total holds
        }

        filtered.push(order); // Add filtered orders for the modal
      });
    });

    setFilteredOrders(filtered);
    setTotalOrdersCount(totalOrders); // Update total orders count dynamically
    setHoldMoneyIssueCount(moneyIssueCount); // Update money issue count dynamically
    setProductNotAvailableCount(productNotAvailableCount); // Update product not available count dynamically
    setTotalOrdersHold(totalHoldOrders); // Update total holds dynamically
  };
  const columns = [
    {
      title: <span className="text-sm text-black">Order Id</span>,
      dataIndex: "orderId",
      key: "orderId",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Enrollment No.</span>,
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">User Amount.</span>,
      dataIndex: "amount",
      key: "amount",
      render: (text) => {
        const formattedAmount = Number(text).toFixed(2); // Convert to number and format with 2 decimal places
        return <span className="text-sm text-black">₹ {formattedAmount}</span>;
      },
    },
    {
      title: <span className="text-sm text-black">Amazon Order Id</span>,
      dataIndex: "amazonOrderId",
      key: "amazonOrderId",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Manager</span>,
      dataIndex: "manager",
      key: "manager",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Delivery Partner</span>,
      dataIndex: "shippingPartner",
      key: "shippingPartner",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Tracking Id</span>,
      dataIndex: "trackingId",
      key: "trackingId",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">SKU</span>,
      dataIndex: "sku",
      key: "sku",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Pincode</span>,
      dataIndex: "pincode",
      key: "pincode",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: <span className="text-sm text-black">Amount</span>,
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text) => <span className="text-sm text-black">₹ {text}</span>,
    },
    {
      title: (
        <span className="text-sm text-black">
          Product Status
          <span style={{ marginLeft: 5 }}>
            <Button
              type="link"
              icon={<FilterOutlined />}
              onClick={() =>
                setProductStatusFilter(productStatusFilter ? null : "")
              }
              style={{ padding: 0 }}
            />
          </span>
        </span>
      ),
      dataIndex: "items",
      key: "productAction",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div className="p-2">
          <Radio.Group
            value={selectedKeys[0]}
            onChange={(e) => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
              handleProductStatusFilter(e.target.value);
              confirm();
            }}
          >
            <Radio value="Available">Available</Radio>
            <Radio value="Unavailable">Unavailable</Radio>
          </Radio.Group>
        </div>
      ),
      onFilter: (value, record) => {
        const allAvailable = record.items.every(
          (item) => item.productAction === "Available"
        );
        return value === "Available" ? allAvailable : !allAvailable;
      },
      render: (items) => {
        const allAvailable = items.every(
          (item) => item.productAction === "Available"
        );
        return allAvailable ? (
          <span className="text-sm text-black text-green-500">Available</span>
        ) : (
          <span className="text-sm text-black text-red-500">Unavailable</span>
        );
      },
    },
  ];

  const dataSource = userData
    .flatMap((user) =>
      (user.orders || []).map((order) => ({
        key: order._id,
        name: user.name,
        amount: user.amount,
        orderId: order.orderId,
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
    .filter((order) => {
      // Check if the date matches if a date is selected
      if (selectedDate) {
        const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD");
        if (orderDate !== selectedDate) return false;
      }

      // Use the filterType to determine if the order should be included
      if (filterType === "paymentStatus" && order.paymentStatus === false) {
        return true; // Include in filtered results
      } else if (
        filterType === "productNotAvailable" &&
        order.items.some((item) => item.productAction !== "Available")
      ) {
        return true; // Include in filtered results
      }

      // Include all other orders when no specific filter is applied
      return filterType === null; // Assumes null means no filter
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <AdminLayout>
      <div className="relative max-w-7xl mx-auto pb-20 min-h-screen">
        <div className="w-full pb-2 px-4 bg-gradient-to-r mb-3 from-blue-500 to-red-300 shadow-lg rounded-lg">
          <h1 className="text-2xl pt-4 font-bold text-white">
            Order detail report
          </h1>
        </div>{" "}
        {/* Date Filter */}
        <div>
          <label htmlFor="date-picker" className="mr-2 text-black text-sm">
            Filter By Date:
          </label>
          <DatePicker
            id="date-picker"
            format="YYYY-MM-DD"
            onChange={handleDateChange}
            placeholder="Select Date"
            className="border border-gray-300 rounded-md shadow-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              className="w-full p-4 bg-gradient-to-r from-yellow-100 to-yellow-300 rounded-lg hover:bg-yellow-200 active:bg-yellow-300 transition duration-150 ease-in-out"
              onClick={() => filterOrders("paymentStatus")}
            >
              <p className="text-lg font-medium text-yellow-800">
                Hold: Money Issue - {holdMoneyIssueCount}
              </p>
            </button>

            <button
              className="w-full p-4 bg-gradient-to-r from-green-100 to-green-300 rounded-lg hover:bg-green-200 active:bg-green-300 transition duration-150 ease-in-out"
              onClick={() => filterOrders("productNotAvailable")}
            >
              <p className="text-lg font-medium text-green-800">
                Hold: Product Not Available - {productNotAvailableCount}
              </p>
            </button>
          </div>
          <br />

          <div className="grid grid-cols-2 gap-4">
            <button className="w-full p-4 bg-gradient-to-r from-blue-100 to-blue-300 rounded-lg hover:bg-blue-200 active:bg-blue-300 transition duration-150 ease-in-out">
              <p className="text-lg font-medium text-blue-800">
                Total Orders - {totalOrdersCount}
              </p>
            </button>

            <button className="w-full p-4 bg-gradient-to-r from-red-100 to-red-300 rounded-lg hover:bg-red-200 active:bg-red-300 transition duration-150 ease-in-out">
              <p className="text-lg font-medium text-red-800">
                Total Orders Hold - {totalOrdersHold}
              </p>
            </button>
          </div>
        </div>
        {/* Display Filtered Orders */}
        <div className="overflow-x-auto mb-16 text-sm text-black">
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 10 }}
            rowKey={(record) => record._id}
            scroll={{ x: "max-content" }}
            className="shadow-lg rounded-lg"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDetailsReporting;
