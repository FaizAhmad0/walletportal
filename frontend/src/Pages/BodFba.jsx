import React, { useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../Layout/UserLayout";

const tableData = [
  {
    date: "2024-08-20",
    orderNumber: "ORD12345",
    totalInvoiceValue: "$1000",
    paymentStatus: 1,
    shippingAddress: "123 Main St, Springfield, IL",
    shippedDate: "2024-08-21",
    status: "Completed", // Add status here
    paymentTimeline: [{ stage: "s1", amount: "$3000", date: "2024-08-19" }],
  },
  {
    date: "2024-08-21",
    orderNumber: "ORD54321",
    totalInvoiceValue: "$1500",
    paymentStatus: 2,
    shippingAddress: "456 Oak St, Springfield, IL",
    shippedDate: "2024-08-22",
    status: "Pending", // Add status here
    paymentTimeline: [
      { stage: "s1", amount: "$3000", date: "2024-08-19" },
      { stage: "s2", amount: "$6000", date: "2024-08-20" },
    ],
  },
  {
    date: "2024-08-21",
    orderNumber: "ORD54321",
    totalInvoiceValue: "$1500",
    paymentStatus: 3,
    shippingAddress: "456 Oak St, Springfield, IL",
    shippedDate: "2024-08-22",
    status: "Pending", // Add status here
    paymentTimeline: [
      { stage: "s1", amount: "$3000", date: "2024-08-19" },
      { stage: "s2", amount: "$6000", date: "2024-08-20" },
      { stage: "s3", amount: "$6000", date: "2024-08-20" },
    ],
  },
  // Add more entries as needed
];

const BodFba = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "ascending",
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.direction === "ascending" ? "descending" : "ascending";
    setSortConfig({ key, direction });
  };

  const sortedData = [...tableData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredData = sortedData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto p-4 bg-white shadow-md rounded-md">
        <h2 className="text-2xl text-center font-bold mb-4">
          B.O.D - Order Details
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="p-2 border border-gray-300 rounded"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Date",
                    "Order Number",
                    "Total Invoice Value",
                    "Payment Status",
                    "Shipping Address",
                    "Shipped Date",
                    "Status",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        handleSort(header.toLowerCase().replace(/ /g, "_"))
                      }
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.totalInvoiceValue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <Link to={`/order-payment-stage/`}>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                          View Payment Stages
                        </button>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <Link to={`/order-shipping-address`}>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                          View Shipping Adress
                        </button>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.shippedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.status}
                    </td>{" "}
                    {/* New Status Column */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default BodFba;
