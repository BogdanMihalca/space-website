// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyCyrCBfFRWGIeTr2yOOWJbDckmDBEpWlIc",
  authDomain: "spacesocial-b7dce.firebaseapp.com",
  databaseURL: "https://spacesocial-b7dce.firebaseio.com",
  projectId: "spacesocial-b7dce",
  storageBucket: "spacesocial-b7dce.appspot.com",
  messagingSenderId: "1090752356777",
  appId: "1:1090752356777:web:ac3a152f3626e7d75024b8",
  measurementId: "G-70WH2NVYYZ",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
// database reference
var db = firebase.firestore();

function logIn() {
  var email = document.getElementById("input-usern").value;
  var password = document.getElementById("input-passw").value;
  var error_lbl = document.getElementById("error-login");
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((user) => {})
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      error_lbl.style.display = "block";
      error_lbl.innerText = errorMessage;
    });
}

var provider = new firebase.auth.GoogleAuthProvider();
var user;
var userUid;
var isNewUser;
function loginWithGoogle() {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      user = result.user;
      userUid = user.uid;
      isNewUser = result.additionalUserInfo.isNewUser;
    })
    .catch(function (error) {
      console.log(error);
    });
}

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    //User is signed In
    if (isNewUser) {
      //adding to database user details infos if user logs in for the first time
      console.log("user photo: " + user.photoURL);
      db.collection("users")
        .doc(userUid)
        .set({
          name: user.displayName,
          email: user.email,
          profile_pic: user.photoURL,
        })
        .then(function () {
          console.log("added user details to db!");
          //redirecting
          window.location = "SocialSpace.html";
        })
        .catch(function (error) {
          console.error("Error while adding user to db: ", error);
        });
    } else {
      window.location = "SocialSpace.html";
    }
  }
});
