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

function createAccount() {
  var email = document.getElementById("input-usern").value;
  var password = document.getElementById("input-passw").value;
  var password2 = document.getElementById("input-passw2").value;
  var name = document.getElementById("input-name").value;
  var error_lbl = document.getElementById("error-create");

  if (validateEmail(email)) {
    if (name.length !== 0) {
      if (password == password2) {
        if (password2.length >= 8) {
          firebase
            .auth()
            .createUserWithEmailAndPassword(email, password2)
            .then((userCred) => {
              // Signed in
              db.collection("users")
                .doc(userCred.user.uid)
                .set({
                  name: name,
                  email: email.toLowerCase(),
                  profile_pic: "none",
                })
                .then(function () {
                  console.log("added user details to db!");
                  //redirecting
                  window.location = "SocialSpace.html";
                })
                .catch(function (error) {
                  console.error("Error while adding user to db: ", error);
                });
            })
            .catch((error) => {
              var errorCode = error.code;
              var errorMessage = error.message;
              error_lbl.style.display = "block";
              error_lbl.innerText = errorMessage;
            });
        } else {
          error_lbl.style.display = "block";
          error_lbl.innerText = "password has to be minimum 8 characters long";
        }
      } else {
        error_lbl.style.display = "block";
        error_lbl.innerText = "password don't match";
      }
    } else {
      error_lbl.style.display = "block";
      error_lbl.innerText = "name can't be empty";
    }
  } else {
    error_lbl.style.display = "block";
    error_lbl.innerText = "not a valid email address";
  }
}

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
