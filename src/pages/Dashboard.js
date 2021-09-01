import React, { useEffect, useState } from "react";
import { Row, Col, PageHeader, Button, Spin, Modal, Select, Input, Card} from 'antd';
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { auth, db, logout, fetchUserName, fetchUsersConversations, loadChatRTD, sendMessageRTD, createNewConversationRTD } from "../firebaseConfig";
import _ from "lodash";
import {SendOutlined} from "@ant-design/icons";

let children = [];
const { Option } = Select;

function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [users, setUsers] = useState(null);
  const [conversations, setConversations] = useState(null);
  const [message, setMessage] = useState("");
  const [messageInput, setMessageInput] = useState(false);
  const [chatTitle, setChatTitle] = useState("Select Conversation or Create One");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newConversationModal, setNewConversationModal] = useState(false);
  const [newConversationParticipants, setNewConversationParticipants] = useState([]);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const history = useHistory();

  const fetchUsers = async () => {
    try {
      const query = await db
          .collection("users")
          .where("uid", "!=", user?.uid)
          .get();
      const data = [];
      const options = [];
      query.forEach(doc => {
        data.push(doc.data());
        options.push(<Option key={doc.data().uid}>{doc.data().name}</Option>);
      });
      children = options;
      setUsers(data);
    } catch (err) {
      console.error(err);
      message.info("An error occured while fetching user data");
    }
  };

  const createUsersConversations = async () => {
    var data = newConversationParticipants;
    data.push(user.uid);
    setNewConversationParticipants([]);
    try {
      var isExistConversation = _.find(conversations,function(o) { return _.difference(o.users,data).length === 0 })
      if(!isExistConversation){
        const query = await createNewConversationRTD(data,user?.uid,name);
        setChat(query.id);
      }else{
        message.warning("This is an exist conversation.");
      }
    } catch (err) {
      console.error(err);
      message.info("An error occured while fetching user data");
    }
  };

  const loadChat = async (id,title) => {
    setChat(id);
    setLoadingUsers(true);
    await loadChatRTD(id,title,user?.uid,messages,setMessages,setLoadingUsers);
    setChatTitle("Chat With " + title);
    setMessageInput(true);
  };

  const sendMessage = async () => {
    await sendMessageRTD(chat,message,user?.uid);
    setMessage("");
  }

  function selectChange(value) {
    setNewConversationParticipants(value);
  }

  const submitNewConversation = () => {
    setNewConversationModal(false);
    createUsersConversations().then(fetchUsersConversations(user?.uid,setConversations));
  };

  const cancelNewConversation = () => {
    setNewConversationModal(false);
    setNewConversationParticipants([]);
  };

  const findUserName = (id) => {
    return (_.find(users, function(o) { return o.uid === id; }))?.name;
  };

  useEffect(() => {
    if (loading)
      return;
    if (!user)
      return history.replace("/");
    fetchUserName(user?.uid,setName).then(fetchUsers(),fetchUsersConversations(user?.uid,setConversations));
  }, [loading,user]);

  return (
      <div>
        <Modal title="New Conservation" visible={newConversationModal} onOk={submitNewConversation} onCancel={cancelNewConversation}>
          <Select mode="multiple" allowClear style={{ width: '100%' }} placeholder="Please select" value={newConversationParticipants} onChange={selectChange}>
            {children}
          </Select>
        </Modal>
        <Spin spinning={loading || loadingUsers}>
          <Row justify="space-around" className={"header-row"}>
            <Col span={23} className={"header-col"}>
              <PageHeader ghost={false} title={name} subTitle={user?.email}
                extra={[
                  <Button key="2" type="primary" onClick={() => setNewConversationModal(true)}>
                    New Conversations
                  </Button>,
                  <Button key="1" type="primary" onClick={logout}>
                    Log out
                  </Button>,
                ]}
              >
              </PageHeader>
            </Col>
          </Row>
          <Row justify="space-around" className={"custom-row"}>
            <Col span={7} className={"column"}>
              <div className={"column-title"}>
                Users
              </div>
              <div className={"column-wrapper"}>
                {users !== null && (
                    <>
                      {
                        users.map(function (x,i) {
                          return (<div className={"list-item"}>{x.name}</div>)
                        })
                      }
                    </>
                )}
              </div>
            </Col>
            <Col span={7} className={"column"}>
              <div className={"column-title"}>
                Conversations
              </div>
              <div className={"column-wrapper"}>
                {conversations !== null && (
                  <>
                    {
                      Object.keys(conversations).map(function (x,i) {
                        let conversationName = [];
                        conversations[x].users.map(function (y,k) {
                          if(y !== user?.uid){
                            let conversationUser = _.find(users, function (o) {return (o.uid === y)})
                            if(conversationUser){
                              conversationName.push(conversationUser.name);
                            }
                          }
                          return null;
                        })
                        return (<div className={"conversations-item"} onClick={() => loadChat(x,conversationName.join(", "))}>{conversationName.join(", ")}</div>)
                      })
                    }
                  </>
                )}
              </div>
            </Col>
            <Col span={7} className={"column"}>
              <div className={"column-title"}>
                {chatTitle}
              </div>
              <div className={"column-wrapper"}>
                {
                  messages.length !== 0 && (
                    <>
                      {
                        messages.map(function (x,i) {
                          return (
                              <>
                                {
                                  x.messageType === 0 ? (
                                      <p className={"system-message"}>{x.message}</p>
                                  ):(
                                      <>
                                        <Card title={x.from === user?.uid ? ("You"):(findUserName(x.from))} bordered={false} className={"message " + (x.from === user?.uid ? ("message-you"):("message-other"))} style={(x.from === user?.uid ? ({textAlign: "end"}):({textAlign: "left"}))}>
                                          <p className={"message-detail"}>{x.message}</p>
                                          <p className={"time"}>{new Intl.DateTimeFormat('tr-TR', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(x.timeStamp)}</p>
                                        </Card>
                                      </>
                                  )
                                }
                              </>
                          )
                        })
                      }
                    </>
                )}
              </div>
              {
                messages.length !== 0 && (
                  <div className={"input-wrapper"}>
                    <Input className={"input-message"} disabled={!messageInput} placeholder="Type your message and press enter." suffix={<SendOutlined />} value={message} onChange={(e) => setMessage(e.target.value)} onPressEnter={() => sendMessage()}/>
                  </div>
                )
              }
            </Col>
          </Row>
        </Spin>
      </div>
  );
}
export default Dashboard;