  var firebaseConfig = {
    apiKey: "AIzaSyBw1lb4TnL95TPBhjOeVpqSgRBtbnUFIEg",
    authDomain: "chat-app-bbe47.firebaseapp.com",
    databaseURL: "https://chat-app-bbe47.firebaseio.com",
    projectId: "chat-app-bbe47",
    storageBucket: "chat-app-bbe47.appspot.com",
    messagingSenderId: "769121017333",
    appId: "1:769121017333:web:e9b723b9869825a3f914bc",
    measurementId: "G-LJT2N8WTR5"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  const auth=firebase.auth();

  function signUp(){
      console.log('sdnsd');
      var email=document.getElementById("email");
      var password=document.getElementById("password");
      const promise=auth.createUserWithEmailAndPassword(email.nodeValue,password.value);
        promise.catch(e=>alert(e.message));
        alert("Signed In");
    }