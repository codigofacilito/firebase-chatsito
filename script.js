
// addDoc({ collection: 'users', data: { username:'uriel' } })
const addDoc = ({collection, data})=>{
  // 3. Guardar la info
  let firestoreRef = firebase.firestore();

  // 3.1 En qué colección agregar el documento
  return firestoreRef.collection(collection).add({
    ...data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp() // Actualizarse automáticamente con firebase functions
  });
};

let views = {
  login: {
    markup: `<div class="login-area">
      <h2>¡Bienvenid@s!</h2>
      <form id="login">
        <input type="text" name="username" id="username">
        <input type="submit" value="Enviar">
      </form>
    </div>`,
    init: (callback) => {
      document.querySelector("#login").addEventListener("submit", (ev) => {
        ev.preventDefault(); //No envíes el form

        let username = document.querySelector("#username").value;

        addDoc({
          collection: 'users',
          data: { username }
        }).then(firebaseResponse => callback(firebaseResponse) )

      });
    }
  },
  chat: {
    markup: `
      <div class='chat-area'>
        <div class="scroll-container">
          <div class='messages'></div>
        </div>
        <form id="chat-form">
          <input type="text" name="message" id="message" autocomplete="off" placeholder='Mensaje...'>
          <label>
            <img src='/add_image.png' height='18'/>
            <input type='file' name='image' id='image' style='display:none' />
          </label>
          <input type='submit' />
        </form>
      </div>
    `,
    init: (callback) => {

      loadMessages();

      document.querySelector("#chat-form").addEventListener("submit",(ev)=>{
        ev.preventDefault();

        let message = document.querySelector("#message").value;

        callback({message});

      })
    }
  }
};

function render(viewName,callback){
  document.querySelector("#content").innerHTML = views[viewName]['markup'];
  views[viewName]['init'](callback);
}

async function loadMessages(){
  firebase.firestore().collection('messages').orderBy("createdAt", "asc").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change)=>{
      if(change.type === "added"){
        return displayMessage(change.doc.data());
      }
      if (change.type === "modified") {
        return displayMessage(change.doc.data());
      }
      if (change.type === "removed") {

      }
    })
  });
}

async function displayMessage(message){
  if(!message.createdAt) return;
  
  let node = document.createElement("div");
  node.classList.add("message");

  node.innerHTML = `<p><strong> ${message.user.username} </strong> dice:</p>
  <div class="bubble">
    <p>${message.message} </p>
    <span>${message.createdAt.toDate().toDateString()}</span>
  </div>
  `;
  let container = document.querySelector(".messages")
  container.append(node);

  container.scrollTop = container.scrollHeight;
}

async function main(){

  // 2. Inicializar el proyecton con Firebase, usando las credenciales en console.firebase.google.com
  var firebaseConfig = {
    apiKey: "AIzaSyDEmNlowgsp3kCpOtSKRCP1oqfNigRW9fA",
    authDomain: "chatsito-facilito.firebaseapp.com",
    projectId: "chatsito-facilito",
    storageBucket: "chatsito-facilito.appspot.com",
    messagingSenderId: "237676819486",
    appId: "1:237676819486:web:e68f05069eccf22a032a0f"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  let user;

  render('login',async function(firebaseUser){
    // user = firebaseUser.data();
    user = (await firebaseUser.get()).data()
    
    render('chat',handleMessage);
  });

  function handleMessage(formData){
    addDoc({
      collection: 'messages',
      data: {
        message: formData.message,
        user
      }
    })
  }

}

main();