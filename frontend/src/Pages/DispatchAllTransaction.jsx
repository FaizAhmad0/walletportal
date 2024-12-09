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
      const response = await axios.get(`${backendUrl}/orders/getallorders`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setTransactions(response.data.orders);
      setFilteredTransactions(response.data.orders);
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
      const filtered = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
          .toISOString()
          .split("T")[0];
        return transactionDate === date; // Compare ISO date strings (YYYY-MM-DD)
      });
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  };

  const columns = [
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      render: (text) => <span style={{ color: "black" }}>{text}</span>,
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      render: (text) => <span style={{ color: "black" }}>{text}</span>,
    },
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
      title: "Debit",
      key: "debit",
      render: (_, record) =>
        record.debit ? (
          <span style={{ color: "red" }}>{record.amount}</span>
        ) : null,
    },
    {
      title: "Credit",
      key: "credit",
      render: (_, record) =>
        record.credit ? (
          <span style={{ color: "green" }}>{record.amount}</span>
        ) : null,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <span style={{ color: "black" }}>{text}</span>,
    },
  ];

  const dataSource = filteredTransactions
    .flatMap((user) =>
      user.transactions.map((transaction) => ({
        key: transaction._id,
        userName: user.name,
        userId: user._id,
        enrollment: user.enrollment,
        userEmail: user.email,
        amount: transaction.amount,
        credit: transaction.credit,
        debit: transaction.debit,
        description: transaction.description,
        createdAt: transaction.createdAt,
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.key}
        pagination={{ pageSize: 10 }}
      />
    </DispatchLayout>
  );
};

export default DispatchAllTransaction;
