import React, { useState } from 'react'

const App = () => {
  const [commands,setCommands] = useState(true)
  const[texts,setTexts]= useState("")
  const[response,setResponse] = useState("")
  const[isListening,setIsListening] = useState(false)
  const assistantName = "Modern AI"; // Assistant name
  const developerName = "Arpit ji"



  const speak = (order,callback)=>{
    const utterance = new SpeechSynthesisUtterance(order)
    utterance.volume = 1; // Set volume (0 to 1, default is 1)
    utterance.rate = 0.9; // Normal speed
    utterance.pitch = 1; // Normal pitch
    
    window.speechSynthesis.cancel();
    utterance.text = order.replace(/,/g, '.');

    window.speechSynthesis.speak(utterance);

    utterance.onend = ()=>{
      //if(callback) callback()
      setTimeout(() => {
        if (callback) callback();
      }, 500 );
    }
  }
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  };
 
  
// for Chatbot API......
  const fetchAIResponse = async (question) => {
    try {
      const apiURL = "https://open-ai-chatgpt.p.rapidapi.com/ask";
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Rapidapi-Key": "f666f11fedmshd3ecfdc09bf2407p1b3d20jsn4de91a82818a",
          "X-Rapidapi-Host": "open-ai-chatgpt.p.rapidapi.com",
        },
        body: JSON.stringify({
          query: question,
        }),
      });
  
      if (!response.ok) {
        throw new Error("API Error");
      }
  
      const data = await response.json();
      const message = data.response || "Sorry, I couldn't understand that.";
  
      speak(message);
      setResponse(message);
      console.log("AI Response: ", message);
    } catch (error) {
      speak("Sorry, I'm unable to process that.");
      setResponse("AI couldn't generate the answer.");
      console.log("API Error: ", error);
    }
  };
  
// for Weaather API
  const fetchWeather = async (city)=>{
    const API_KEY = '7acc0e6badd3bcbffdd7b51ba4b9d272';
    // const city1='';
   await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const temp = data.main.temp;
      const weatherCondition = data.weather[0].description;
      const message = `The current temperature in ${city} is ${temp}°C with ${weatherCondition}.`;
      speak(message);
      setResponse(message);
    })
    .catch((error) => {
      speak("I couldn't fetch the weather. Please check the city name.");
    });
  };


  const handleCommands = (command)=>{
   let message ="";

    // Fetching weather...
    if(command.includes("weather")){
      let city = command.replace("weather in","").trim()
        fetchWeather(city)
    }
    // Asking for developer name.....
    else if (command.includes("who is your developer")) {
      message = `Only ${developerName} is my creator `;
      speak(message);
      setResponse(message +"🔥");
    }

    //for Calling her by name
    else if(command.includes(assistantName.toLowerCase())){
      message = `Yes ${assistantName} is Listening!..How i assist you ?`;
      speak(message);
      setResponse(message);
    }
    
    //for opening whatsapp...
    else if(command.includes("open whatsapp")){
      message = "Opening Whatsapp.."
      speak(message)
      setResponse(message)
      window.open("https://www.whatsapp.com","_blank")
    }

    //for opening instagram...
    else if(command.includes("open instagram")){
      message = "Opening instagram..."
      speak(message)
      setResponse(message)
      window.open("https://www.instagram.com","_blank")
    }

      //for opening facebook......
    else if(command.includes("open facebook")){
      message = "Opening Facebook..."
      speak(message)
      setResponse(message)
      window.open("https://www.facebook.com","_blank")
    }

    //for Time and Date.....
    else if(command.includes("time")){
      message = (`The current time is ${new Date().toLocaleTimeString()}.`);
      speak(message);
      setResponse(message);
    }
    else if(command.includes('date')){
      message = (`The current date is ${new Date().toLocaleDateString()}.`);
      speak(message);
      setResponse(message);
    }

    // for math calculation...
    else if(command.match(/^[\d\s\+\-\*\/x\(\)]+$/)){
      try {
        const fixedCommand = command.replace(/x/g, "*").replace(/\s+/g,"");
        const result = Function(`'use strict'; return (${fixedCommand})`)();
        message = `The answer is ${result}`;
        speak(message);
        setResponse(message);
      } catch {
        message = "I can't solve that.";
        speak(message);
        setResponse(message);
      }
    }

    //for playing music....
    else if (command.includes('play')) {
      const song = command.replace('play', '').trim();
      message = `Playing ${song} on YouTube.`;
      speak(message);
      setResponse(message);
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`);
    }

    //for opening youtube.....
    else if(command.includes("open youtube")){
      message = "Opening Youtube..."
      speak(message)
      setResponse(message)
      window.open("https://www.youtube.com","_blank")
    }

    //for opening x....
    else if(command.includes("open twitter")){
      message = "Opening X..."
      speak(message)
      setResponse(message)
      window.open("https://x.com","_blank")
    }
    //for searching through google....
    // else{
    //   message = `Searching google for...${command}`
    //   speak(message)
    //   setResponse(message)
    //   window.open(`https://www.google.com/search?q=${encodeURIComponent(command)}`)
    // }

    else {
      speak("Let me think...");
      fetchAIResponse(command);
    }

}

  const startListening = ()=>{
    
    if(!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)){
      const message = "Speech Recognition doesn't support on this browser"
      setResponse(message)
      alert(message)
      return;
    }
    const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)
    recognition.lang = "en-US"
    recognition.onresult =(event)=>{
      const text = event.results[0][0].transcript.toLowerCase()
      setTexts(text)
      handleCommands(text)
      setTimeout(()=>{
        setIsListening(false);
      }, 500)
    }
     setIsListening(true)
    recognition.start()
    
  }
  const stopListening = () => {
    window.speechSynthesis.cancel();
    setIsListening(false);
    speak('Listening stopped');
  };

  const handleClick = ()=>{
    speak(`${getGreeting()}your personal Assistant is here. ?`, startListening)
    
  }

  return (
    <div className='w-screen h-screen bg_img flex items-center justify-center'>

      <div className='flex items-center justify-center flex-col gap-6 mr-80'>
        <h1 className='text-teal-400 font-bold text-6xl  '>Voice Assistant</h1>
        <p className='text-md font-semibold text-emerald-300'>{
          commands?"Please give me a command..!":"Processing your commands..."
          }</p>

        <button
          onClick={handleClick}
          className={`relative px-6 py-3 text-white text-lg md:text-xl mt-6 w-full sm:w-auto rounded-lg
            transition-all duration-300 hover:scale-105 ${
              isListening ? 'animate-pulse' : ''
            }`}>
            {isListening?"Listening....":"Start Listening"}
            {/* Glowing Border Effect */}
            <span className="absolute inset-0 rounded-lg border-2 border-transparent animate-glow"></span>
      
        </button>
        {isListening && (
          <button onClick={stopListening} className='px-4 py-2 bg-red-600 text-white rounded-lg mt-4'>
            Stop Listening
          </button>
        )}

        <div className='rbg-gray-800 p-5 md:p-6 shadow-2xl rounded-lg h-auto max-w-md w-full mt-6 space-y-4 text-white scrollbar-hide'>
          <h2 className='text-md text-white'>
            <span className='text-sky-800 text-xl font-bold'>Recognition Speech :</span>
            <br />
            {texts || "No Command Recieved"}
          </h2>
          <h4 className='text-md text-white'>
            <span className='text-lg text-red-800 font-bold '>Response :</span>
            <br />
            {response || "Waiting for input...."}
          </h4>

        </div>
        {/* Tailwind Animations */}
      <style>
        {`
          @keyframes glow {
            0% { border-color: #06b6d4; box-shadow: 0 0 5px #06b6d4; }
            50% { border-color: #0ea5e9; box-shadow: 0 0 15px #0ea5e9; }
            100% { border-color: #06b6d4; box-shadow: 0 0 5px #06b6d4; }
          }

          .animate-glow {
            animation: glow 1.5s infinite alternate ease-in-out;
          }

          @keyframes wave {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(2); }
          }

          .animate-wave {
            animation: wave 1s infinite ease-in-out;
          }

          .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Hide scrollbar for Chrome, Safari */
          }
          .scrollbar-hide {
            -ms-overflow-style: none; /* Hide scrollbar for IE and Edge */
            scrollbar-width: none; /* Hide scrollbar for Firefox */
          }
        `}
      </style>

      </div>

    </div>
  )

}

export default App


