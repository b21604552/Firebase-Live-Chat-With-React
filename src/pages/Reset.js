import React, { useEffect } from "react";
import { Form, Input, Button, Spin } from 'antd';
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import {auth, sendPasswordResetEmail} from "../firebaseConfig";

function Reset() {
  const [user, loading] = useAuthState(auth);
  const history = useHistory();

  const onFinish = (values) => {
    sendPasswordResetEmail(values.email);
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
              <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                <Input />
              </Form.Item>

              <Form.Item wrapperCol={{ span: 24 }}>
                <div className={"button-div"}>
                  <Button type="primary" htmlType="submit">Send password reset email</Button>
                </div>
              </Form.Item>

              <Form.Item wrapperCol={{span: 24 }}>
                <div className={"button-div"}>
                  Don't have an account?&nbsp;<Link to="/register">Register</Link>&nbsp;now.
                </div>
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </>
  );
}
export default Reset;