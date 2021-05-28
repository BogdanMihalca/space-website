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
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    //User is signed In
    currentUser = user;
    //load user details in the views
    loadUserDetails();
    //load the threads from db
    laodThreads();
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
/*______________________________________________________
          populating the user details(photo/name/email)
  ______________________________________________________
*/
function loadUserDetails() {
  var userUid = currentUser.uid.toString();
  var docRef = db.collection("users").doc(userUid);
  docRef
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
        Createing  New Thread in the database 
        along with the first message in it
______________________________________________________
 */
function createNewThread() {
  var threadTitle = document.getElementById("newThreadTitle").value;
  var threadMessage = document.getElementById("newThreadMessage").value;
  var threadCheck = document.getElementById("newThreadCheck").checked;
  var error_lbl = document.getElementById("error-newThread");
  var threadDataToCreate;
  var messageData;

  if (currentUser) {
    //if the user is loggedIn
    if (threadTitle.length > 0) {
      //check if there is title entered
      if (threadMessage.length > 0) {
        //same for  message
        if (threadCheck) {
          //the checkbox
          threadDataToCreate = {
            Author: userData.name,
            DateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
            Title: threadTitle,
            messageCount: 1,
          };
          messageData = {
            Author: db.collection("users").doc(currentUser.uid),
            DateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
            message: threadMessage,
          };
          //adding the thread data
          db.collection("threads")
            .add(threadDataToCreate)
            .then(function (docRef) {
              //after crating the thread document
              //we're adding the message tot the collection
              docRef
                .collection("messages")
                .add(messageData)
                .then(function (docRef) {
                  //relaoding threads data after
                  closeNewThreadModal();
                  laodThreads();
                })
                .catch(function (error) {
                  error_lbl.style.display = "block";
                  error_lbl.innerText = "Error saving message to DB " + error;
                });
            })
            .catch(function (error) {
              error_lbl.style.display = "block";
              error_lbl.innerText = "Error saving thread to DB " + error;
            });
        } else {
          error_lbl.style.display = "block";
          error_lbl.innerText = "Please chek the condition";
        }
      } else {
        error_lbl.style.display = "block";
        error_lbl.innerText = "Mesaage can't be empty";
      }
    } else {
      error_lbl.style.display = "block";
      error_lbl.innerText = "Title can't be empty";
    }
  } else {
    error_lbl.style.display = "block";
    error_lbl.innerText = "Log In First";
  }
}
/*______________________________________________________
    Fetching threads and generating the views for them
  ______________________________________________________
*/
function laodThreads() {
  var firstbatchOfThreads = db
    .collection("threads")
    .orderBy("DateCreated", "desc")
    .limit(25); //limit to first 25 docs
  document.getElementById("threadsHolder").innerHTML =
    "<div id='loader' class='load'></div>";
  firstbatchOfThreads
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        var threadData = doc.data();
        //getting last message from current thread
        var messageRef = doc.ref.collection("messages");
        messageRef
          .orderBy("DateCreated", "desc")
          .limit(1)
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc2) {
              var messageData = doc2.data();
              //now getting the author details of the last message
              messageData.Author.get()
                .then(function (doc3) {
                  if (doc3.exists) {
                    //generating the thread view in html
                    var lastmessageAuthorData = doc3.data();

                    var creationDate = new Date(
                      threadData.DateCreated.seconds * 1000
                    );

                    document.getElementById("threadsHolder").innerHTML =
                      document.getElementById("threadsHolder").innerHTML +
                      "<article class='thread-article blue-shadow-card' data-aos='fade-up-right' data-aos-duration='1000'><div><h3>" +
                      threadData.Title +
                      "</h3><p>Last message from: " +
                      lastmessageAuthorData.name +
                      "</p><p class='message'>" +
                      messageData.message +
                      "</p></div> <div class='right-article-part'><div><h5>Date created:  \t&#128197;\t" +
                      creationDate.toDateString() +
                      "\t\t&#128337;\t" +
                      creationDate.getHours() +
                      ":" +
                      creationDate.getMinutes() +
                      "</h5><h5>Created by: " +
                      lastmessageAuthorData.name +
                      "</h5><h5>Messages count: " +
                      threadData.messageCount +
                      "</h5></div><button class='opn-thread-btn make-hv-orange' data-threadid='" +
                      doc.id +
                      "' onClick='openThread(this)'>Open thread</button><div class='article-conn-line'></div></article>";
                  } else {
                    console.log("No such document!");
                  }
                })
                .catch(function (error) {
                  console.log(
                    "Error getting last message author document:",
                    error
                  );
                });
            });
            document.getElementById("loader").style.display = "none";
          })
          .catch(function (error) {
            console.log("Error getting last message document: ", error);
          });
      });
    })
    .catch(function (error) {
      console.log("Error getting Threads documents: ", error);
    });
}

/*______________________________________________________
      Opening speciffic thread (saving id in local)
  ______________________________________________________
*/
function openThread(callingElement) {
  var threadID = callingElement.dataset["threadid"];
  // Check browser support
  if (typeof Storage !== "undefined") {
    // Store the id
    localStorage.setItem("currentThreadID", threadID.toString());
    window.open("socialspace-thread.html", "_self");
  } else {
    alert("We are sorry but this browser is not supported.");
  }
}
//scroll animation
AOS.init();
