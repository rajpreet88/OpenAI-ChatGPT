import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

let loader = (element) => {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }

  }, 300)

}

let typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else {
      clearInterval(interval);
    }
  }, 20)
}

let generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

let chatStripe = (isAI, value, uniqueId) => {
  return (
    `
    <div class="wrapper ${isAI && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src="${isAI ? bot : user}" alt="${isAI ? 'bot' : 'user'}"/>
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
       </div>
    </div>
    
    `
  )
}

let handleSubmit = async (event) => {
  event.preventDefault();

  const data = new FormData(form);

  //user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get('userinput'));
  form.reset();

  //bot's chatStripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight; //automatically scroll the page as per the viewport. This is thus gonna put the new message in view always
  let messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);


  //fetch the OpenAI response from the server using OpenAIApi -> bot's response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('userinput')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = ' ';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData)

  } else {
    const err = await response.text();
    messageDiv.innerHTML = `Something went wrong`;
    alert(err);
  }


}

form.addEventListener('submit', (e) => {
  handleSubmit(e);
});

//for enter key press in the keyboard
form.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { //13 is keycode for enter key
    e.preventDefault();

    handleSubmit(e);
  }
})