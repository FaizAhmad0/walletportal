import React, { useEffect, useState } from "react";
import AccountantLayout from "../Layout/AccountantLayout";
import { Table, message, Select, Radio, Input, Button, DatePicker } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment"; // Make sure to install moment.js via npm or yarn

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const { Search } = Input;
const { RangePicker } = DatePicker;

const AccountantDash = () => {
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  console.log(dateRange);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState(""); // Initialize with empty string for no filter
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search
  const handleDateRangeChange = (dates) => {
    setDateRange(dates); // Set the selected date range
  };
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

    // Apply Search Filter
    if (searchQuery.trim() !== "") {
      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => {
            const orderId = order.orderId?.toString().toLowerCase() || "";
            const enrollment = user.enrollment?.toString().toLowerCase() || "";
            const amazonOrderId =
              order.items[0]?.amazonOrderId?.toString().toLowerCase() || "N/A";

            return (
              orderId.includes(searchQuery.toLowerCase()) ||
              enrollment.includes(searchQuery.toLowerCase()) ||
              amazonOrderId.includes(searchQuery.toLowerCase())
            );
          }),
        }))
        .filter((user) => user.orders.length > 0); // Ensure to filter out users with no orders left after filtering
    }

    // Apply Date Range Filter
    if (dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange;

      // Ensure startDate and endDate are Dayjs objects (if they're not already)
      const startMoment = dayjs(startDate);
      const endMoment = dayjs(endDate);

      filtered = filtered
        .map((user) => ({
          ...user,
          orders: user.orders.filter((order) => {
            const orderDate = dayjs(order.createdAt);

            // Check if the order date is within the range (inclusive)
            return (
              orderDate.isSameOrAfter(startMoment) &&
              orderDate.isSameOrBefore(endMoment)
            );
          }),
        }))
        .filter((user) => user.orders.length > 0); // Remove users with no orders after filtering
    }

    setFilteredOrders(filtered);
  };
  const handleDownload = () => {
    // Create a new data source excluding the items field and updating createdAt
    const dataToDownload = dataSource.map(
      ({
        shippingPartner,
        trackingId,
        amazonOrderId,
        _id,
        key,
        amount,
        items,
        createdAt, // Include createdAt to modify it
        ...rest
      }) => {
        // Format createdAt to only include the date
        const formattedCreatedAt = new Date(createdAt)
          .toISOString()
          .split("T")[0];

        // Format items to include separate GST fields
        const itemsWithGST = items.map(
          ({ IGST, CGST, SGST, shippingPrice, ...itemRest }) => ({
            ...itemRest,
            shippingPrice, // Keep the shippingPrice field in its place
            shippingGstRate: 18, // Add shippingGstRate field next to shippingPrice
            IGST,
            CGST,
            SGST,
          })
        );

        return {
          ...rest,
          createdAt: formattedCreatedAt, // Use the formatted date
          items: itemsWithGST, // Include updated items with GST and shippingGstRate
        };
      }
    );

    const jsonData = JSON.stringify(dataToDownload, null, 2); // Convert data to JSON format

    const blob = new Blob([jsonData], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders_data.json"; // File name for the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRowClassName = (record) => {
    const allUnavailable = record.items.some(
      (item) => item.productAction !== "Available"
    );
    const isPaymentPending = !record.paymentStatus;

    if (allUnavailable && isPaymentPending) {
      return "bg-red-100"; // Light red
    } else if (allUnavailable) {
      return "bg-yellow-100"; // Light yellow
    } else if (isPaymentPending) {
      return "bg-pink-100"; // Light pink
    } else {
      return ""; // Default row color
    }
  };

  const columns = [
    {
      title: <span className="text-sm">Date</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span className="text-sm">
          {new Date(text).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      title: <span className="text-sm">Invoice No.</span>,
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Voucher type</span>,
      dataIndex: "voucherType",
      key: "voucherType",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Party Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Invoice Value</span>,
      dataIndex: "invoiceVal",
      key: "invoiceVal",
      render: (text) => {
        const formattedAmount = Number(text).toFixed(2); // Convert to number and format with 2 decimal places
        return <span className="text-sm">₹ {formattedAmount}</span>;
      },
    },
    {
      title: <span className="text-sm">Item Name</span>,
      dataIndex: "itemName",
      key: "itemName",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Quantity</span>,
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Item Rate</span>,
      dataIndex: "price",
      key: "price",
      render: (text) => <span className="text-sm">₹ {text}</span>,
    },
    {
      title: <span className="text-sm">Bill to</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Mailing Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Address</span>,
      dataIndex: "address",
      key: "address",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Country</span>,
      dataIndex: "country",
      key: "country",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">State</span>,
      dataIndex: "state",
      key: "state",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Pincode</span>,
      dataIndex: "pincode",
      key: "pincode",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Item Rate</span>,
      dataIndex: "itemRate",
      key: "itemRate",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">GST Registration Type</span>,
      dataIndex: "gstRegistration",
      key: "gstRegistration",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Assessee of Other Territory</span>,
      dataIndex: "aot",
      key: "aot",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">GSTIN/UIN</span>,
      dataIndex: "gst",
      key: "gst",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: <span className="text-sm">Place of supply</span>,
      dataIndex: "state",
      key: "state",
      render: (text) => <span className="text-sm">{text}</span>,
    },
    // Add new column for GST rate (CGST, SGST or IGST)
    {
      title: <span className="text-sm">GST Rate</span>,
      dataIndex: "items", // Accessing items array
      key: "gstRateDisplay",
      render: (_, record) => (
        <div>
          {record.items.map((item, index) => (
            <div key={index} className="text-sm">
              {item.gstRateDisplay}
            </div>
          ))}
        </div>
      ),
    },
  ];

  const dataSource = filteredOrders
    .flatMap((user) =>
      user.orders
        .filter((order) => order.paymentStatus === true) // Filter orders by paymentStatus
        .map((order) => ({
          key: order._id,
          name: user.name,
          amount: user.amount,
          invoiceNo: order.orderId,
          enrollment: user.enrollment,
          amazonOrderId: order.items[0]?.amazonOrderId || "N/A",
          itemName: order.items[0]?.name || "N/A",
          manager: user.manager,
          shippingPartner: order.items[0]?.shippingPartner || "N/A",
          quantity: order.items[0]?.quantity || "N/A",
          price: order.items[0]?.price || "N/A",
          trackingId: order.items[0]?.trackingId || "N/A",
          sku: order.items[0]?.sku || "N/A",
          pincode: order.items[0]?.pincode || "N/A",
          address: user.address,
          aot: "No",
          itemRate: "Nos",
          country: user.country,
          state: user.state,
          gst: user.gst,
          invoiceVal: order.finalAmount,
          paymentStatus: order.paymentStatus,
          items: order.items.map((item) => {
            const gstRate = parseFloat(item.gstRate || 0);
            const totalPrice = parseFloat(item.totalPrice || 0);
            const shippingPrice = parseFloat(item.shippingPrice || 0);

            const itemGST = (totalPrice * gstRate) / 100;
            const shippingGST = (shippingPrice * 18) / 100;
            const totalGST = itemGST + shippingGST;

            let gstData = {};
            if (user.state === "Rajasthan") {
              const halfGstRate = (totalGST / 2).toFixed(2);
              gstData = {
                CGST: parseFloat(halfGstRate),
                SGST: parseFloat(halfGstRate),
                IGST: 0,
              };
            } else {
              gstData = {
                CGST: 0,
                SGST: 0,
                IGST: parseFloat(totalGST.toFixed(2)),
              };
            }

            return {
              ...item,
              gstData,
            };
          }),
          gstRegistration: "Regular",
          voucherType: "Sales",
          _id: order._id,
          createdAt: order.createdAt,
        }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Trigger filtering whenever filters or orders change
  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatusFilter, timeFilter, searchQuery, dateRange, orders]);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTimeFilter = (e) => {
    setTimeFilter(e.target.value);
  };

  return (
    <AccountantLayout>
      <div className="relative max-w-full mx-auto pb-20">
        <h1 className="text-xl font-semibold text-black-600 mb-4">
          Accountant Dashboard
        </h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center justify-between space-x-4">
            {" "}
            {/* Time Filter */}
            {/* <div className="text-sm text-black">
              <Radio.Group
                buttonStyle="solid"
                onChange={handleTimeFilter}
                value={timeFilter}
              >
                <Radio.Button value="yesterday">Yesterday</Radio.Button>{" "}
                <Radio.Button value="today">Today</Radio.Button>
                <Radio.Button value="week">This Week</Radio.Button>
                <Radio.Button value="month">This Month</Radio.Button>
                <Radio.Button value="year">This Year</Radio.Button>
              </Radio.Group>
            </div> */}
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              style={{ width: 300 }}
            />
            <div>
              <Search
                placeholder="Search by Order ID, Enrollment No., Amazon Order ID"
                value={searchQuery}
                onChange={handleSearchChange} // This will still handle input change
                style={{ width: 300 }}
                className="text-sm"
                enterButton // Adds a search icon/button next to the input
              />
            </div>
            <div>
              <Button type="primary" onClick={handleDownload}>
                Download Orders Data
              </Button>
            </div>
            <h2
              className="text-lg font-bold bg-blue-50 text-blue-800 py-1 mt-3 px-4 rounded-md"
              style={{
                display: "inline-block",
              }}
            >
              Total Orders: {filteredOrders?.length}
            </h2>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto mb-16 text-sm">
          <Table
            bordered
            columns={columns}
            dataSource={dataSource}
            rowClassName={getRowClassName}
            pagination={{ pageSize: 10 }}
            rowKey={(record) => record._id}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>
    </AccountantLayout>
  );
};

export default AccountantDash;








// import React, { useEffect, useState } from "react";
// import AccountantLayout from "../Layout/AccountantLayout";
// import { Table, message, Select, Radio, Input, Button, DatePicker } from "antd";
// import axios from "axios";
// import dayjs from "dayjs";
// import moment from "moment"; // Make sure to install moment.js via npm or yarn

// const backendUrl = process.env.REACT_APP_BACKEND_URL;
// const { Search } = Input;
// const { RangePicker } = DatePicker;

// const AccountantDash = () => {
//   const [orders, setOrders] = useState([]);
//   const [dateRange, setDateRange] = useState([null, null]);
//   console.log(dateRange);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
//   const [timeFilter, setTimeFilter] = useState(""); // Initialize with empty string for no filter
//   const [searchQuery, setSearchQuery] = useState(""); // Add state for search
//   const handleDateRangeChange = (dates) => {
//     setDateRange(dates); // Set the selected date range
//   };
//   // Fetch orders from backend
//   const getOrders = async () => {
//     try {
//       const response = await axios.get(`${backendUrl}/orders/getallorders`, {
//         headers: {
//           Authorization: localStorage.getItem("token"),
//         },
//       });
//       setOrders(response.data.orders);
//       setFilteredOrders(response.data.orders);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       message.error("Failed to fetch orders. Please try again.");
//     }
//   };

//   useEffect(() => {
//     getOrders();
//   }, []);

//   const filterOrders = () => {
//     let filtered = [...orders];

//     // Apply Payment Status Filter
//     if (paymentStatusFilter !== "") {
//       const isPaid = paymentStatusFilter === "true";
//       filtered = filtered
//         .map((user) => ({
//           ...user,
//           orders: user.orders.filter((order) => order.paymentStatus === isPaid),
//         }))
//         .filter((user) => user.orders.length > 0);
//     }

//     // Apply Search Filter
//     if (searchQuery.trim() !== "") {
//       filtered = filtered
//         .map((user) => ({
//           ...user,
//           orders: user.orders.filter((order) => {
//             const orderId = order.orderId?.toString().toLowerCase() || "";
//             const enrollment = user.enrollment?.toString().toLowerCase() || "";
//             const amazonOrderId =
//               order.items[0]?.amazonOrderId?.toString().toLowerCase() || "N/A";

//             return (
//               orderId.includes(searchQuery.toLowerCase()) ||
//               enrollment.includes(searchQuery.toLowerCase()) ||
//               amazonOrderId.includes(searchQuery.toLowerCase())
//             );
//           }),
//         }))
//         .filter((user) => user.orders.length > 0); // Ensure to filter out users with no orders left after filtering
//     }

//     // Apply Date Range Filter
//     if (dateRange[0] && dateRange[1]) {
//       const [startDate, endDate] = dateRange;

//       // Ensure startDate and endDate are Dayjs objects (if they're not already)
//       const startMoment = dayjs(startDate);
//       const endMoment = dayjs(endDate);

//       filtered = filtered
//         .map((user) => ({
//           ...user,
//           orders: user.orders.filter((order) => {
//             const orderDate = dayjs(order.createdAt);

//             // Check if the order date is within the range (inclusive)
//             return (
//               orderDate.isSameOrAfter(startMoment) &&
//               orderDate.isSameOrBefore(endMoment)
//             );
//           }),
//         }))
//         .filter((user) => user.orders.length > 0); // Remove users with no orders after filtering
//     }

//     setFilteredOrders(filtered);
//   };
//   const handleDownload = () => {
//     // Create a new data source excluding the items field and updating createdAt
//     const dataToDownload = dataSource.map(
//       ({
//         shippingPartner,
//         trackingId,
//         amazonOrderId,
//         _id,
//         key,
//         amount,
//         items,
//         createdAt, // Include createdAt to modify it
//         ...rest
//       }) => {
//         // Format createdAt to only include the date
//         const formattedCreatedAt = new Date(createdAt)
//           .toISOString()
//           .split("T")[0];

//         // Format items to include separate GST fields
//         const itemsWithGST = items.map(({ IGST, CGST, SGST, ...itemRest }) => ({
//           ...itemRest,
//           IGST,
//           CGST,
//           SGST,
//         }));

//         return {
//           ...rest,
//           createdAt: formattedCreatedAt, // Use the formatted date
//           items: itemsWithGST, // Include updated items with separate GST fields
//         };
//       }
//     );

//     const jsonData = JSON.stringify(dataToDownload, null, 2); // Convert data to JSON format

//     const blob = new Blob([jsonData], { type: "application/json" });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "orders_data.json"; // File name for the download
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const getRowClassName = (record) => {
//     const allUnavailable = record.items.some(
//       (item) => item.productAction !== "Available"
//     );
//     const isPaymentPending = !record.paymentStatus;

//     if (allUnavailable && isPaymentPending) {
//       return "bg-red-100"; // Light red
//     } else if (allUnavailable) {
//       return "bg-yellow-100"; // Light yellow
//     } else if (isPaymentPending) {
//       return "bg-pink-100"; // Light pink
//     } else {
//       return ""; // Default row color
//     }
//   };

//   const columns = [
//     {
//       title: <span className="text-sm">Date</span>,
//       dataIndex: "createdAt",
//       key: "createdAt",
//       render: (text) => (
//         <span className="text-sm">
//           {new Date(text).toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//           })}
//         </span>
//       ),
//     },
//     {
//       title: <span className="text-sm">Invoice No.</span>,
//       dataIndex: "invoiceNo",
//       key: "invoiceNo",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Voucher type</span>,
//       dataIndex: "voucherType",
//       key: "voucherType",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Party Name</span>,
//       dataIndex: "name",
//       key: "name",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Invoice Value</span>,
//       dataIndex: "invoiceVal",
//       key: "invoiceVal",
//       render: (text) => {
//         const formattedAmount = Number(text).toFixed(2); // Convert to number and format with 2 decimal places
//         return <span className="text-sm">₹ {formattedAmount}</span>;
//       },
//     },
//     {
//       title: <span className="text-sm">Item Name</span>,
//       dataIndex: "itemName",
//       key: "itemName",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Quantity</span>,
//       dataIndex: "quantity",
//       key: "quantity",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Item Rate</span>,
//       dataIndex: "price",
//       key: "price",
//       render: (text) => <span className="text-sm">₹ {text}</span>,
//     },
//     {
//       title: <span className="text-sm">Bill to</span>,
//       dataIndex: "name",
//       key: "name",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Mailing Name</span>,
//       dataIndex: "name",
//       key: "name",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Address</span>,
//       dataIndex: "address",
//       key: "address",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Country</span>,
//       dataIndex: "country",
//       key: "country",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">State</span>,
//       dataIndex: "state",
//       key: "state",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Pincode</span>,
//       dataIndex: "pincode",
//       key: "pincode",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Item Rate</span>,
//       dataIndex: "itemRate",
//       key: "itemRate",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">GST Registration Type</span>,
//       dataIndex: "gstRegistration",
//       key: "gstRegistration",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Assessee of Other Territory</span>,
//       dataIndex: "aot",
//       key: "aot",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">GSTIN/UIN</span>,
//       dataIndex: "gst",
//       key: "gst",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     {
//       title: <span className="text-sm">Place of supply</span>,
//       dataIndex: "state",
//       key: "state",
//       render: (text) => <span className="text-sm">{text}</span>,
//     },
//     // Add new column for GST rate (CGST, SGST or IGST)
//     {
//       title: <span className="text-sm">GST Rate</span>,
//       dataIndex: "items", // Accessing items array
//       key: "gstRateDisplay",
//       render: (_, record) => (
//         <div>
//           {record.items.map((item, index) => (
//             <div key={index} className="text-sm">
//               {item.gstRateDisplay}
//             </div>
//           ))}
//         </div>
//       ),
//     },
//   ];

//   const dataSource = filteredOrders
//     .flatMap((user) =>
//       user.orders
//         .filter((order) => order.paymentStatus === true) // Filter orders by paymentStatus
//         .map((order) => ({
//           key: order._id,
//           name: user.name,
//           amount: user.amount,
//           invoiceNo: order.orderId,
//           enrollment: user.enrollment,
//           amazonOrderId: order.items[0]?.amazonOrderId || "N/A",
//           itemName: order.items[0]?.name || "N/A",
//           manager: user.manager,
//           shippingPartner: order.items[0]?.shippingPartner || "N/A",
//           quantity: order.items[0]?.quantity || "N/A",
//           price: order.items[0]?.price || "N/A",
//           trackingId: order.items[0]?.trackingId || "N/A",
//           sku: order.items[0]?.sku || "N/A",
//           pincode: order.items[0]?.pincode || "N/A",
//           address: user.address,
//           aot: "No",
//           itemRate: "Nos",
//           country: user.country,
//           state: user.state,
//           gst: user.gst,
//           invoiceVal: order.finalAmount,
//           paymentStatus: order.paymentStatus,
//           items: order.items.map((item) => {
//             const gstRate = parseFloat(item.gstRate || 0);
//             const totalPrice = parseFloat(item.totalPrice || 0);
//             const shippingPrice = parseFloat(item.shippingPrice || 0);

//             const itemGST = (totalPrice * gstRate) / 100;
//             const shippingGST = (shippingPrice * 18) / 100;
//             const totalGST = itemGST + shippingGST;

//             let gstData = {};
//             if (user.state === "Rajasthan") {
//               const halfGstRate = (totalGST / 2).toFixed(2);
//               gstData = {
//                 CGST: parseFloat(halfGstRate),
//                 SGST: parseFloat(halfGstRate),
//                 IGST: 0,
//               };
//             } else {
//               gstData = {
//                 CGST: 0,
//                 SGST: 0,
//                 IGST: parseFloat(totalGST.toFixed(2)),
//               };
//             }

//             return {
//               ...item,
//               gstData,
//             };
//           }),
//           gstRegistration: "Regular",
//           voucherType: "Sales",
//           _id: order._id,
//           createdAt: order.createdAt,
//         }))
//     )
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//   // Trigger filtering whenever filters or orders change
//   useEffect(() => {
//     filterOrders();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [paymentStatusFilter, timeFilter, searchQuery, dateRange, orders]);
//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   const handleTimeFilter = (e) => {
//     setTimeFilter(e.target.value);
//   };

//   return (
//     <AccountantLayout>
//       <div className="relative max-w-full mx-auto pb-20">
//         <h1 className="text-xl font-semibold text-black-600 mb-4">
//           Accountant Dashboard
//         </h1>
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center justify-between space-x-4">
//             {" "}
//             {/* Time Filter */}
//             {/* <div className="text-sm text-black">
//               <Radio.Group
//                 buttonStyle="solid"
//                 onChange={handleTimeFilter}
//                 value={timeFilter}
//               >
//                 <Radio.Button value="yesterday">Yesterday</Radio.Button>{" "}
//                 <Radio.Button value="today">Today</Radio.Button>
//                 <Radio.Button value="week">This Week</Radio.Button>
//                 <Radio.Button value="month">This Month</Radio.Button>
//                 <Radio.Button value="year">This Year</Radio.Button>
//               </Radio.Group>
//             </div> */}
//             <RangePicker
//               value={dateRange}
//               onChange={handleDateRangeChange}
//               format="DD/MM/YYYY"
//               style={{ width: 300 }}
//             />
//             <div>
//               <Search
//                 placeholder="Search by Order ID, Enrollment No., Amazon Order ID"
//                 value={searchQuery}
//                 onChange={handleSearchChange} // This will still handle input change
//                 style={{ width: 300 }}
//                 className="text-sm"
//                 enterButton // Adds a search icon/button next to the input
//               />
//             </div>
//             <div>
//               <Button type="primary" onClick={handleDownload}>
//                 Download Orders Data
//               </Button>
//             </div>
//             <h2
//               className="text-lg font-bold bg-blue-50 text-blue-800 py-1 mt-3 px-4 rounded-md"
//               style={{
//                 display: "inline-block",
//               }}
//             >
//               Total Orders: {filteredOrders?.length}
//             </h2>
//           </div>
//         </div>

//         {/* Orders Table */}
//         <div className="overflow-x-auto mb-16 text-sm">
//           <Table
//             bordered
//             columns={columns}
//             dataSource={dataSource}
//             rowClassName={getRowClassName}
//             pagination={{ pageSize: 10 }}
//             rowKey={(record) => record._id}
//             scroll={{ x: "max-content" }}
//           />
//         </div>
//       </div>
//     </AccountantLayout>
//   );
// };

// export default AccountantDash;