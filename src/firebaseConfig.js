import firebase from "firebase";
import _ from "lodash";
import uuid from "react-uuid";
import {message} from "antd";

const firebaseConfig = {
  apiKey: "AIzaSyDLw6m1_53_xZzC5WOrZ54WyhMw-6FQXj0",
  authDomain: "live-chat-with-react-js.firebaseapp.com",
  databaseURL: "https://live-chat-with-react-js-default-rtdb.firebaseio.com",
  projectId: "live-chat-with-react-js",
  storageBucket: "live-chat-with-react-js.appspot.com",
  messagingSenderId: "1098340234328",
  appId: "1:1098340234328:web:db2c0c664d65138581862d"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();
const realTime = app.database();

const googleProvider = new firebase.auth.GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const res = await auth.signInWithPopup(googleProvider);
    const user = res.user;
    const query = await db
        .collection("users")
        .where("uid", "==", user.uid)
        .get();
    if (query.docs.length === 0) {
      await db.collection("users").add({
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const signInWithEmailAndPassword = async (email, password) => {
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await auth.createUserWithEmailAndPassword(email, password);
    const user = res.user;
    await db.collection("users").add({
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const sendPasswordResetEmail = async (email) => {
  try {
    await auth.sendPasswordResetEmail(email);
    message.info("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logout = () => {
  auth.signOut();
};

const loadChatRTD = async (id,title,userUid,messages,setMessages,setLoadingUsers) => {
  let firstLoad = false;
  await realTime.ref('chats/' + id).on('value',snapshot=>{
    if(snapshot.exists()){
      const newMessage=snapshot.val();
      let tempArray= [];
      Object.keys(newMessage).map(function (x,i) {
        return (tempArray.push(newMessage[x]))
      });
      tempArray = _.sortBy(tempArray,"timeStamp")
      if(!firstLoad) {
        firstLoad = true;
      }else {
        if(tempArray.length !== messages.length && tempArray[tempArray.length - 1].from !== userUid){
          message.info("New Message From Chat With " + title + " !!");
        }
      }
      setMessages(tempArray);
      setLoadingUsers(false);
    }
    setLoadingUsers(false);
  });
};

const sendMessageRTD = async (chat,message,userUid) => {
  await realTime.ref('chats/' + chat + "/" + uuid()).set({
    message : message,
    messageType : 1,
    from: userUid,
    timeStamp : Date.now(),
  }).catch(alert);
};

const createNewConversationRTD = async (data,userUid,name) => {
  const query = await db.collection("conversations").add({
    users: data
  })
  realTime.ref('chats/' + query.id + "/" + uuid()).set({
    message : "Chat room created by " + name,
    from: userUid,
    messageType : 0,
    timeStamp : Date.now(),
  }).catch(alert);
  return query.id;
}

const fetchUsersConversations = async (userUid,setConversations) => {
  try {
    const query = await db
        .collection("conversations")
        .where("users", "array-contains", userUid)
        .get();
    const data = [];
    query.forEach(doc => {
      data[doc.id] = doc.data();
    });
    setConversations(data);
  } catch (err) {
    console.error(err);
    message.info("An error occured while fetching user data");
  }
};

const fetchUserName = async (userUid,setName) => {
  try {
    const query = await db
        .collection("users")
        .where("uid", "==", userUid)
        .get();
    const data = await query.docs[0].data();
    setName(data.name);
  } catch (err) {
    console.error(err);
    message.info("An error occured while fetching user data");
  }
};

export {
  realTime,
  auth,
  db,
  signInWithGoogle,
  signInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchUserName,
  fetchUsersConversations,
  loadChatRTD,
  sendMessageRTD,
  createNewConversationRTD,
  logout,
};
