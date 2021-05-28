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

//user refference
var currentUser;
var userData;
var userRef;

//thred refference
var threadRef;
var threadData;

//messages refference
var messageRef;

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    //User is signed In
    currentUser = user;
    //laod user details in the views
    loadUserDetails();
    //load  details of the thread
    loadThreadDetails();
    //load messages in this thread
    loadThreadMessages();
  } else {
    // No user is signed in.
    window.location = "socialspace-login.html";
  }
});

function logOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      // Sign-out successful.
    })
    .catch(function (error) {
      // An error happened.
      console.log(error);
    });
}

/*______________________________
      Modal functionalities
  ______________________________
*/
var modal = document.getElementById("Modal");
var close = document.getElementsByClassName("close-modal")[0];

function openModal() {
  modal.style.display = "block";
}
function closeModal() {
  modal.style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

/*______________________________________________________
    populating the user details(photo/name/email)
  ______________________________________________________
*/
function loadUserDetails() {
  var userUid = currentUser.uid.toString();
  userRef = db.collection("users").doc(userUid);
  userRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        userData = doc.data();
        document.getElementById("user-name").innerText = userData.name;
        if (userData.profile_pic == "none") {
          document.getElementById("user-photo").src =
            "images/sosspaceimg/profile-user-placeholder.png";
        } else {
          document.getElementById("user-photo").src = userData.profile_pic;
        }
      } else {
        // doc.data() will be undefined in this case
        console.log("No data found for curent user!");
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });

  document.getElementById("user-email").innerText = currentUser.email;
}
/*______________________________________________________
    populating the thread title, and other details
  ______________________________________________________
*/
function loadThreadDetails() {
  var currentThreadID = window.localStorage.getItem("currentThreadID");
  threadRef = db.collection("threads").doc(currentThreadID.toString());
  threadRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        threadData = doc.data();
        document.getElementById("thredTitle").innerText = threadData.Title;
        document.getElementById("threadAuthor").innerText = threadData.Author;
        var creationDate = new Date(threadData.DateCreated.seconds * 1000);
        document.getElementById("crdate").innerText =
          creationDate.toDateString() +
          "\t" +
          creationDate.getHours() +
          ":" +
          creationDate.getMinutes();
        document.getElementById("messageCount").innerText =
          threadData.messageCount;
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });
}
/*______________________________________________________
    load all messages and generate views for them 
  ______________________________________________________
*/
function loadThreadMessages() {
  //getting the messages
  messageRef = threadRef.collection("messages");
  document.getElementById("messageHolder").innerHTML =
    "<div id='loader' class='load'></div>";
  messageRef
    .orderBy("DateCreated", "asc")
    .limit(25)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (messageDoc) {
        var messageData = messageDoc.data();
        //now getting the author details of the message
        messageData.Author.get()
          .then(function (authorDoc) {
            if (authorDoc.exists) {
              var messageAuthorData = authorDoc.data();
              var messagePostDate = new Date(
                messageData.DateCreated.seconds * 1000
              );
              var messageUserPicRef;
              if (messageAuthorData.profile_pic == "none") {
                //setting the placeholder if has no image
                messageUserPicRef =
                  "images/sosspaceimg/profile-user-placeholder.png";
              } else {
                messageUserPicRef = messageAuthorData.profile_pic;
              }
              if (authorDoc.id == currentUser.uid) {
                //generating the thread view with author options
                document.getElementById("messageHolder").innerHTML =
                  document.getElementById("messageHolder").innerHTML +
                  '<article class="message-article" data-aos="zoom-in-right"> <div class="auth-msg-options"><button class="dlt-msg-btn" onClick="deleteMessage(\'' +
                  messageDoc.id +
                  '\')"><i class="far fa-trash-alt"></i></button>' +
                  '<button class="upt-msg-btn" onClick="editMessage(\'' +
                  messageDoc.id +
                  '\',this)"> <i class="fas fa-edit"></i></button ></div > <div class="msg-user-area"><div class="profile-astro-msg"><img class="user-photo-msg" src="' +
                  messageUserPicRef +
                  '"alt="user profile image"><img class="user-ph-overlay-msg" src="images/sosspaceimg/astro-photo_3.png" alt="profile overlay"></div><h3 class="user-name-msg">' +
                  messageAuthorData.name +
                  " : </h3></div><div class='message-box'><p>" +
                  messageData.message +
                  "</p><div class='details-msg'><p> <i class='fas fa-edit'></i> On: \t\t" +
                  messagePostDate.toDateString() +
                  "\t\t AT \t\t" +
                  messagePostDate.getHours() +
                  ":" +
                  messagePostDate.getMinutes() +
                  "</p></div></div></article>";
              } else {
                //generating the thread view withouth author options
                document.getElementById("messageHolder").innerHTML =
                  document.getElementById("messageHolder").innerHTML +
                  "<article class='message-article' data-aos='zoom-in-right'><div class='msg-user-area'><div class='profile-astro-msg'><img class='user-photo-msg' src='" +
                  messageUserPicRef +
                  "'alt='user profile image'><img class='user-ph-overlay-msg' src='images/sosspaceimg/astro-photo_3.png' alt='profile overlay'></div><h3 class='user-name-msg'>" +
                  messageAuthorData.name +
                  " : </h3></div><div class='message-box'><p>" +
                  messageData.message +
                  "</p><div class='details-msg'><p> <i class='fas fa-edit'></i> On: \t\t" +
                  messagePostDate.toDateString() +
                  "\t\t AT \t\t" +
                  messagePostDate.getHours() +
                  ":" +
                  messagePostDate.getMinutes() +
                  "</p></div></div></article>";
              }
            } else {
              console.log("No such document!");
            }
          })
          .catch(function (error) {
            console.log("Error getting  message author document:");
          });
      });
      document.getElementById("loader").style.display = "none";
    })
    .catch(function (error) {
      console.log("Error getting message document: ", error);
    });
}

/*______________________________________________________
   post a message to the current thread and reload data 
  ______________________________________________________
*/
function postMessage() {
  var messageText = document.getElementById("newMessage").innerHTML;
  messageText = messageText.replaceAll("<div>", "<br>");
  messageText = messageText.replaceAll("</div>", "");

  var error_lbl = document.getElementById("error-newMessage");
  if (messageText.length > 0) {
    var messageObj = {
      Author: userRef,
      DateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
      message: messageText,
    };

    messageRef
      .add(messageObj)
      .then(function (docRef) {
        //incrementing messagecount on thread
        threadRef.update({
          messageCount: firebase.firestore.FieldValue.increment(1),
        });
        //updating the view ..the real value will be fetched at page load
        document.getElementById("messageCount").innerText =
          parseInt(document.getElementById("messageCount").innerText, 10) + 1;

        //relaoding messages data after
        loadThreadMessages();
        //clear the message box
        document.getElementById("newMessage").innerHTML = "";
      })
      .catch(function (error) {
        error_lbl.style.display = "block";
        error_lbl.innerText = "Error saving message to DB " + error;
      });
  } else {
    error_lbl.style.display = "block";
    error_lbl.innerText = "write a message to submit!";
  }
}

/*______________________________________________________
   delete own message open modal and confirm before  
  ______________________________________________________
*/
var messageToBeDeleted;
function deleteMessage(messageId) {
  openModal();
  messageToBeDeleted = messageId;
}
function confirmDeleteMessage() {
  messageRef
    .doc(messageToBeDeleted.toString())
    .delete()
    .then(function () {
      //incrementing messagecount on thread
      threadRef.update({
        messageCount: firebase.firestore.FieldValue.increment(-1),
      });
      //updating the view ..the real value will be fetched at page load
      document.getElementById("messageCount").innerText =
        parseInt(document.getElementById("messageCount").innerText, 10) - 1;

      closeModal();
      //reload messages if successfull
      loadThreadMessages();
    })
    .catch(function (error) {
      console.error("Error removing document: ", error);
    });
}
/*__________________
   edit own message  
  __________________
*/
var messageToBeUpdated;
var oldMessage;
var messageContainer;
var updateOpen = true;
function editMessage(messageId, obj) {
  messageToBeUpdated = messageId;
  if (updateOpen) {
    updateOpen = false;
    messageContainer = obj.parentElement.parentElement
      .getElementsByClassName("message-box")[0]
      .getElementsByTagName("p")[0];
    //save the previous message
    oldMessage = messageContainer.innerHTML;
    messageContainer.innerHTML =
      '<span id="updateMessage" role="textbox" contenteditable>' +
      oldMessage +
      "</span><br>" +
      '<p id="error-editMessage">Error:</p><button type="button" id="updateMessagePost" onclick="updateMessage()">update</button><button type="button" id="cancelUpdateMessage" onclick="cancelUpdateMessage()">Cancel</button>';
  }
}

function cancelUpdateMessage() {
  messageContainer.innerHTML = oldMessage;
  updateOpen = true;
}
function updateMessage() {
  var messageText = document.getElementById("updateMessage").innerHTML;
  messageText = messageText.replaceAll("<div>", "<br>");
  messageText = messageText.replaceAll("</div>", "");

  var error_lbl = document.getElementById("error-editMessage");
  if (messageText.length > 0) {
    messageRef
      .doc(messageToBeUpdated.toString())
      .update({
        message: messageText,
      })
      .then(function () {
        console.log("Message successfully updated!");
        //update the view directly, updated data will be fetched from database on page reload
        messageContainer.innerHTML = messageText;
        updateOpen = true;
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  } else {
    error_lbl.style.display = "block";
    error_lbl.innerText =
      "Message can't be empty, maybe you want to delete this message?";
  }
}

//scroll animation
AOS.init();
