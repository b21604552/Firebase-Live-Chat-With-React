import React, { useEffect } from "react";
import { Form, Input, Button, Spin } from 'antd';
import { Link, useHistory } from "react-router-dom";
import { auth, signInWithEmailAndPassword, signInWithGoogle } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

function Login() {
  const [user, loading] = useAuthState(auth);
  const history = useHistory();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (user) history.replace("/dashboard");
  }, [user, loading, history]);

  const onFinish = (values) => {
    signInWithEmailAndPassword(values.email, values.password)
  };

  return (
      <div className={"form"}>
        <Spin spinning={loading}>
          <Form name="basic" layout="vertical" onFinish={onFinish}>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ span: 24 }}>
              <div className={"button-div"}>
                <Button type="primary" htmlType="submit">Sign In</Button>
              </div>
            </Form.Item>

            <Form.Item wrapperCol={{span: 24 }}>
              <div className={"button-div"}>
                <Button type="primary" onClick={signInWithGoogle}>Login with Google</Button>
              </div>
            </Form.Item>

            <Form.Item wrapperCol={{span: 24 }}>
              <div className={"button-div"}>
                <Link to="/reset">Forgot Password?</Link>
              </div>
            </Form.Item>

            <Form.Item wrapperCol={{span: 24 }}>
              <div className={"login-button-div"}>
                Don't have an account?&nbsp;<Link to="/register">Register</Link>&nbsp;now.
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </div>
  );
}

export default Login;
