import React, { useEffect, useState } from "react";
import DispatchLayout from "../Layout/DispatchLayout";
import { Table, message, Input } from "antd";
import axios from "axios";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const DispatchAllTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterDate, setFilterDate] = useState("");

  const getTransaction = async () => {
    try {
      const response = await axios.get(`${backendUrl}/orders/alltransactions`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      const sortedTransactions = response.data.transactions.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Failed to fetch transactions. Please try again.");
    }
  };

  useEffect(() => {
    getTransaction();
  }, []);

  const handleSearch = (date) => {
    setFilterDate(date);

    if (date) {
      const filtered = transactions.filter(
        (transaction) =>
          new Date(transaction.createdAt).toLocaleDateString() ===
          new Date(date).toLocaleDateString()
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  };

  const columns = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <span style={{ color: "black" }}>{text}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span style={{ color: "black" }}>
          {new Date(text).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Type",
      key: "type",
      render: (_, record) => {
        if (record.credit) {
          return <span style={{ color: "green" }}>Credit</span>;
        } else if (record.debit) {
          return <span style={{ color: "red" }}>Debit</span>;
        }
        return null;
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <span style={{ color: "black" }}>{text}</span>,
    },
  ];

  return (
    <DispatchLayout>
      <div className="w-full pb-2 px-4 mb-3 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
        <h1 className="text-2xl pt-4 font-bold text-white">All Transactions</h1>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <Input.Search
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          onSearch={handleSearch}
          placeholder="Filter by date"
          style={{ width: 250 }}
          enterButton="Search"
        />
      </div>
      <Table
        bordered
        dataSource={filteredTransactions}
        columns={columns}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 10 }}
      />
    </DispatchLayout>
  );
};

export default DispatchAllTransaction;
