const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;

let currentStep = "welcome";
let userData = {
  service: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
  nationalId: "",
  date: ""
};

// 🔊 speak out loud
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

// 📋 Disability options
const disabilityList = [
  { value: "movement", label: "Movement" },
  { value: "visual", label: "Visual" },
  { value: "hearing", label: "Hearing" },
  { value: "mental", label: "Mental" },
  { value: "other", label: "Other" }
];

// 📋 Support options
const supportList = [
  { value: "financial", label: "Financial" },
  { value: "medical", label: "Medical" },
  { value: "companion", label: "Companion" },
  { value: "education", label: "Education" },
  { value: "tech", label: "Tech" }
];

// 🗂️ Keywords for each service
const serviceKeywords = {
  "renew-passport": ["passport", "renew passport"],
  "renew-license": ["license", "renew license", "driver license"],
  "renew-id": ["id", "renew id", "renew my id", "identity card"],
  "lost-passport": ["lost passport", "my passport is gone", "report passport"],
  "lost-license": ["lost license", "my license is gone", "report license"],
  "lost-id": ["lost id", "lost my id", "identity lost"],
  "new-license": ["new license", "issue license", "get a new license"],
  "new-id": ["new id", "issue id", "identity card new"],
  "support": ["support", "help", "special needs", "disability support"]
};

// ☎️ Emergency numbers keywords
const emergencyKeywords = {
  "999": ["police", "call police", "emergency police"],
  "997": ["ambulance", "call ambulance", "medical emergency"],
  "998": ["fire", "civil defense", "firefighter"],
  "996": ["road security", "traffic police"],
  "993": ["traffic accidents", "accident"],
  "933": ["electricity", "power"],
  "939": ["water", "call water"]
};

// 🔎 detect service from transcript
function detectService(transcript) {
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    for (const word of keywords) {
      if (transcript.toLowerCase().includes(word)) {
        return service;
      }
    }
  }
  return null;
}

// 🔎 detect emergency from transcript
function detectEmergency(transcript) {
  const lower = transcript.toLowerCase();

  // detect by keyword
  for (const [number, keywords] of Object.entries(emergencyKeywords)) {
    for (const word of keywords) {
      if (lower.includes(word)) {
        return number;
      }
    }
  }

  // detect if user said "call 999"
  const numberMatch = lower.match(/call\s*(\d{3})/);
  if (numberMatch) {
    return numberMatch[1];
  }

  return null;
}

// 🚀 start Mueen
function startMueen() {
  speak("Welcome to Mueen, your smart assistant. What service do you need today?");
  recognition.start();
}

// 🎤 when speech result comes
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.trim();
  console.log("🗣️ User said:", transcript);

  // -------------------
  // 1️⃣ Welcome
  // -------------------
  if (currentStep === "welcome") {
    // first check emergency
    const detectedEmergency = detectEmergency(transcript);
    if (detectedEmergency) {
      const callNumber = detectedEmergency;
      const message = `We are now calling ${callNumber}.`;

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "en-US";

      utterance.onend = () => {
        window.location.href = `emergency.html?call=${callNumber}`;
      };

      speechSynthesis.speak(utterance);
      return;
    }

    // check services
    const detectedService = detectService(transcript);
    if (detectedService === "support") {
      userData.service = "support";
      localStorage.setItem("service", "support");
      speak("Great. Please tell me your email address.");
      currentStep = "email";
    }
    else if (detectedService) {
      userData.service = detectedService;
      localStorage.setItem("service", detectedService);
      speak("Great. Please tell me your email address.");
      currentStep = "email";
    } else {
      speak("Sorry, I didn’t understand. Say for example: renew passport, renew license, support, or call police.");
    }
  }

  // -------------------
  // 2️⃣ Login
  // -------------------
  else if (currentStep === "email") {
    userData.email = transcript;
    localStorage.setItem("email", transcript);

    speak("Thank you. Now, please tell me your password.");
    currentStep = "password";
  }

  else if (currentStep === "password") {
    userData.password = transcript;
    localStorage.setItem("password", transcript);

    speak("Done. Logging you in now.");

    if (userData.service === "support") {
      window.location.href = "support.html?action=autofill";
    } else {
      window.location.href = "services.html?action=autofill";
    }
  }

  // -------------------
  // 3️⃣ Support form
  // -------------------
  else if (currentStep === "fullName") {
    userData.fullName = transcript;
    localStorage.setItem("fullName", transcript);
    document.getElementById("full-name").value = transcript;

    speak("Thank you. Now, please tell me your national ID.");
    currentStep = "nationalId";
  }

  else if (currentStep === "nationalId") {
    userData.nationalId = transcript;
    localStorage.setItem("nationalId", transcript);
    document.getElementById("national-id").value = transcript;

    speak("Got it. What is your phone number?");
    currentStep = "phone";
  }

  else if (currentStep === "phone") {
    userData.phone = transcript;
    localStorage.setItem("phone", transcript);
    document.getElementById("phone").value = transcript;

    speak("Now, please tell me your type of disability. Say movement, visual, hearing, mental, or other.");
    currentStep = "disabilityChoice"; 
  }

  else if (currentStep === "disabilityChoice") {
    const lower = transcript.toLowerCase();

    const match = disabilityList.find(d => lower.includes(d.value.toLowerCase()));
    if (match) {
      userData.disability = match.value;
      document.getElementById("disability").value = match.value;

      speak("You chose " + match.label + ". Now choose the type of support. Say financial, medical, companion, education, or tech.");
      currentStep = "supportChoice";
    } else {
      speak("I didn’t understand. Please say your disability type, like movement, visual, hearing, mental, or other.");
    }
  }

  else if (currentStep === "supportChoice") {
    const lower = transcript.toLowerCase();

    const match = supportList.find(s => lower.includes(s.value.toLowerCase()));
    if (match) {
      userData.support = match.value;
      document.getElementById("support").value = match.value;

      speak("You chose " + match.label + ". Do you want to send the request now?");
      currentStep = "confirmSend";
    } else {
      speak("I didn’t understand. Please say the support type, like financial, medical, companion, education, or tech.");
    }
  }

  else if (currentStep === "confirmSend") {
    if (transcript.toLowerCase().includes("yes")) {
      document.querySelector(".support-form").submit();
      speak("Your support request has been sent. Goodbye.");
    } else {
      speak("Request canceled.");
    }
  }

  // -------------------
  // 4️⃣ Services form
  // -------------------
  else if (currentStep === "serviceFullName") {
    userData.fullName = transcript;
    localStorage.setItem("fullName", transcript);
    document.getElementById("full-name").value = transcript;

    speak("Thank you. Now, please tell me your national ID.");
    currentStep = "serviceNationalId";
  }

  else if (currentStep === "serviceNationalId") {
    userData.nationalId = transcript;
    localStorage.setItem("nationalId", transcript);
    document.getElementById("national-id").value = transcript;

    speak("Got it. What is your phone number?");
    currentStep = "servicePhone";
  }

  else if (currentStep === "servicePhone") {
    userData.phone = transcript;
    localStorage.setItem("phone", transcript);
    document.getElementById("phone").value = transcript;

    speak("Please choose your service. For example: renew passport, new license, Lost Passport.");
    currentStep = "serviceChoice";
  }

else if (currentStep === "serviceChoice") {
  const lower = transcript.toLowerCase();

  const serviceOptions = [
    { value: "renew-passport", label: "Renew Passport" },
    { value: "renew-license", label: "Renew License" },
    { value: "renew-id", label: "Renew ID" },
    { value: "lost-passport", label: "Lost Passport" },
    { value: "lost-license", label: "Lost License" },
    { value: "lost-id", label: "Lost ID" },
    { value: "new-license", label: "New License" },
    { value: "new-id", label: "New ID" }
  ];

  const match = serviceOptions.find(
    s => lower.includes(s.value) || lower.includes(s.label.toLowerCase())
  );

  if (match) {
    userData.service = match.value;
    document.getElementById("service").value = match.value;
    speak(`You chose ${match.label}. Now, please tell me the date you prefer.`);
    currentStep = "serviceDate";
  } else {
    speak("I didn’t understand. Please say the service name like renew passport, renew ID, lost ID, or new ID.");
  }
}


  else if (currentStep === "serviceDate") {
    userData.date = transcript;
    localStorage.setItem("date", transcript);
    document.getElementById("date").value = transcript;

    speak("Do you want to submit the request now?");
    currentStep = "serviceConfirmSend";
  }

  else if (currentStep === "serviceConfirmSend") {
    if (transcript.toLowerCase().includes("yes")) {
      document.querySelector(".service-form").submit();
      speak("Your service request has been sent. Goodbye.");
    } else {
      speak("Request canceled.");
    }
  }
};

// 🔄 keep listening
recognition.onend = () => {
  recognition.start();
};

// 🔁 start support flow
function startMueenFlow() {
  currentStep = "fullName";
  speak("Welcome to support. Please tell me your full name.");
  recognition.start();
}

// 🔁 start services flow
function startMueenServicesFlow() {
  currentStep = "serviceFullName";
  speak("Welcome to services. Please tell me your full name.");
  recognition.start();
}
