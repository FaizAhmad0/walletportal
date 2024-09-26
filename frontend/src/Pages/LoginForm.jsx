import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "aos/dist/aos.css";
import AOS from "aos";
import "./LoginForm.css";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const LoginForm = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    AOS.init();
  }, []);

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    axios
      .post(`${backendUrl}/login`, values)
      .then((response) => {
        messageApi.success(response.data.message);

        form.resetFields();

        localStorage.setItem("name", response.data.name);
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);

        if (response.data.role === "user") {
          navigate("/user-order", {
            state: { message: response.data.message },
          });
        } else if (response.data.role === "manager") {
          navigate("/manager-dash", {
            state: { message: response.data.message },
          });
        } else if (response.data.role === "admin") {
          navigate("/admin-dash", {
            state: { message: response.data.message },
          });
        } else if (response.data.role === "dispatch") {
          navigate("/dispatch-dash", {
            state: { message: response.data.message },
          });
        } else if (response.data.role === "supervisor") {
          navigate("/supervisor-dash", {
            state: { message: response.data.message },
          });
        }
      })
      .catch((error) => {
        messageApi.error(error.response?.data?.message || "Login failed");
        console.error("Failed to send data to backend:", error);
      });
  };

  return (
    <>
      <div className="login-container" data-aos="fade-up">
        {contextHolder}
        <Form
          form={form}
          name="login_form"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <div className="login-logo">
            <img
              src="https://support.saumiccraft.com/wp-content/uploads/2023/05/logo-saumic-new.png"
              alt="Logo"
            />
          </div>
          <Form.Item
            name="enrollment"
            rules={[
              { required: true, message: "Please input your enrollment!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enrollment" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              style={{ backgroundColor: "rgb(71,178,228)" }}
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
        <div className="login-footer">
          <p>
            By logging in you agree to our <a href="/">privacy policy</a> &{" "}
            <a href="/">terms of service</a>.
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
