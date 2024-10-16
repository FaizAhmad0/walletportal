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
      <div className="container mx-auto p-6 pt-0">
        <Title level={2} className="font-bold mb-6">
          Here are all the Managers
        </Title>

        {/* Search input */}
        <Search
          placeholder="Search by enrollment"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "40%", marginBottom: "16px" }}
        />

        {/* CSV Download Button */}
        <Button
          type="primary"
          onClick={downloadCSV}
          style={{ marginBottom: "16px", marginLeft: "10px" }}
        >
          Download CSV
        </Button>

        <Title level={5}>Total Managers: {clients.length}</Title>

        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 5 }}
          bordered
          className="managers-table"
        />

        {filteredClients.length === 0 && (
          <p className="text-center text-gray-600">No managers found.</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AllManagers;
