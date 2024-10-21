import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import { Table, Input, Typography, Button } from "antd";

const { Search } = Input;
const { Title } = Typography;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AllManagers = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  const getClients = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallmanagers`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setClients(response.data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  // Filter clients by enrollment based on search term
  const filteredClients = clients.filter((client) =>
    client.enrollment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to download CSV
  const downloadCSV = () => {
    const headers = ["Manager Name", "Email", "Enrollment", "Phone", "GMS"]; // Define CSV headers without GMS

    const rows = clients.map((client) => [
      client.name,
      client.email,
      client.enrollment,
      client.mobile,
      client.gms,
    ]); // Convert client data to rows without GMS

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "managers_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: "Manager Name",
      dataIndex: "name",
      key: "name",
      className: "text-xs",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "text-xs",
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      className: "text-xs",
    },
    {
      title: "Phone",
      dataIndex: "mobile",
      key: "mobile",
      className: "text-xs",
    },

    {
      title: "GMS",
      dataIndex: "gms",
      key: "gms",
      className: "text-xs",
      render: (text) => <span className="text-xs">{text.toFixed(3)}</span>,
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-2 bg-white shadow-md rounded-lg">
        {/* Title */}
        <h1 className="text-3xl font-bold italic mb-4">All Managers</h1>

        {/* Search input */}
        <div className="flex items-center mb-4">
          <Search
            placeholder="Search by enrollment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "50%", marginRight: "12px" }}
            className="shadow-sm"
            allowClear
          />
          {/* CSV Download Button */}
          <Button
            type="primary"
            onClick={downloadCSV}
            style={{
              marginLeft: "10px",
              fontSize: "small",
              fontWeight: "bold",
            }}
          >
            Download Managers
          </Button>
        </div>

        {/* Managers count */}
        <Title level={5} className="text-gray-600 italic mb-4">
          Total Managers: {clients.length}
        </Title>

        {/* Managers Table */}
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 7 }}
          bordered
          className="managers-table shadow-sm"
          style={{ borderRadius: "8px", overflow: "hidden" }}
        />

        {/* No results message */}
        {filteredClients.length === 0 && (
          <div className="flex justify-center mt-6">
            <p className="text-center text-gray-500 italic">
              No managers found.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AllManagers;
