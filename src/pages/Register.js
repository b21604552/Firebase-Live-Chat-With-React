import React, { useEffect } from "react";
import { Form, Input, Button, Spin } from 'antd';
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useHistory } from "react-router-dom";
import { auth, registerWithEmailAndPassword, signInWithGoogle } from "../firebaseConfig";

function Register() {
  const [user, loading] = useAuthState(auth);
  const history = useHistory();

  const onFinish = (values) => {
    registerWithEmailAndPassword(values.name, values.email, values.password)
  };

  useEffect(() => {
    if (loading) return;
    if (user) history.replace("/dashboard");
  }, [user, loading, history]);
  return (
      <>
        <div className={"form"}>
          <Spin spinning={loading}>
            <Form name="basic" layout="vertical" onFinish={onFinish}>

              <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
                <Input />
              </Form.Item>

              <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                <Input />
              </Form.Item>

              <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                <Input.Password />
              </Form.Item>

              <Form.Item wrapperCol={{ span: 24 }}>
                <div className={"button-div"}>
                  <Button type="primary" htmlType="submit">Register</Button>
                </div>
              </Form.Item>

              <Form.Item wrapperCol={{span: 24 }}>
                <div className={"button-div"}>
                  <Button type="primary" onClick={signInWithGoogle}>Register with Google</Button>
                </div>
              </Form.Item>

              <Form.Item wrapperCol={{span: 24 }}>
                <div className={"button-div"}>
                  Already have an account?&nbsp;<Link to="/">Login</Link>&nbsp;now.
                </div>
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </>
  );
}
export default Register;