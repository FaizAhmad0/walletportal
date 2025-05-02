import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import axios from "axios";
import {
  Table,
  Typography,
  Spin,
  Alert,
  DatePicker,
  Button,
  Space,
} from "antd";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AllTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  console.log(transactions);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${backendUrl}/orders/transactions`);
        const sorted = (response.data.transactions || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTransactions(sorted);
        setFilteredTransactions(sorted);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleDateFilter = (dates) => {
    setDateRange(dates);
    if (!dates || dates.length === 0) {
      setFilteredTransactions(transactions);
      return;
    }

    const [start, end] = dates;
    const filtered = transactions.filter((txn) => {
      const txnDate = dayjs(txn.createdAt);
      return (
        txnDate.isAfter(start.startOf("day")) &&
        txnDate.isBefore(end.endOf("day"))
      );
    });
    setFilteredTransactions(filtered);
  };

  const downloadCSV = () => {
    const data = (dateRange ? filteredTransactions : transactions).map(
      (txn, index) => ({
        "#": index + 1,
        "User Name": txn.userName || "N/A",
        "User Email": txn.userEmail || "N/A",
        Amount: txn.amount,
        Credit: txn.credit ? "Yes" : "No",
        Debit: txn.debit ? "Yes" : "No",
        Type: txn.credit ? "Credit" : "Debit",
        Description: txn.description,
        Date: new Date(txn.createdAt).toLocaleString(),
      })
    );

    const csvRows = [];
    const headers = Object.keys(data[0]).join(",");
    csvRows.push(headers);

    data.forEach((row) => {
      const values = Object.values(row)
        .map((val) => `"${val}"`) // escape values
        .join(",");
      csvRows.push(values);
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
    },
    {
      title: "paymentId",
      dataIndex: "paymentId",
      key: "paymentId",
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Type",
      key: "type",
      render: (record) =>
        record.credit ? (
          <span className="text-green-600 font-semibold">Credit</span>
        ) : (
          <span className="text-red-600 font-semibold">Debit</span>
        ),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (credit) => (credit ? "Yes" : "No"),
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (debit) => (debit ? "Yes" : "No"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-4">
        <Title level={3}>All Transactions</Title>

        <Space className="mb-4" wrap>
          <RangePicker
            onChange={handleDateFilter}
            allowClear
            format="YYYY-MM-DD"
          />
          <Button type="primary" onClick={downloadCSV}>
            Download CSV
          </Button>
        </Space>

        {loading ? (
          <Spin size="large" />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : (
          <Table
            dataSource={filteredTransactions}
            columns={columns}
            rowKey={(record, index) => index}
            pagination={{ pageSize: 50 }}
            scroll={{ x: true }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AllTransaction;
