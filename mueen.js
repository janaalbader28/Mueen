const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "ar-SA";
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
  utterance.lang = "ar-SA";
  speechSynthesis.speak(utterance);
}

// 📋 Disability options
const disabilityList = [
  { value: "movement", label: "حركة" },
  { value: "visual", label: "بصري" },
  { value: "hearing", label: "سمعي" },
  { value: "mental", label: "ذهني" },
  { value: "other", label: "أخرى" }
];

// 📋 Support options
const supportList = [
  { value: "financial", label: "مالي" },
  { value: "medical", label: "طبي" },
  { value: "companion", label: "مرافق" },
  { value: "education", label: "تعليمي" },
  { value: "tech", label: "تقني" }
];

// 🗂️ Keywords for each service
const serviceKeywords = {
  "renew-passport": ["جواز السفر", "تجديد جواز السفر"],
  "renew-license": ["رخصة القيادة", "تجديد الرخصة", "تجديد رخصة القيادة"],
  "renew-id": ["الهوية", "تجديد الهوية", "تجديد بطاقتي"],
  "lost-passport": ["فقدت جواز السفر", "جوازي مفقود", "ابلاغ عن جواز"],
  "lost-license": ["فقدت الرخصة", "رخصتي مفقودة", "ابلاغ عن رخصة"],
  "lost-id": ["فقدت الهوية", "بطاقتي مفقودة", "الهوية مفقودة"],
  "new-license": ["رخصة جديدة", "اصدار رخصة جديدة"],
  "new-id": ["هوية جديدة", "اصدار هوية جديدة"],
"support": ["مساعدة", "دعم", "احتياجات خاصة"],
  "inquiries": ["استفسار", "سؤال", "اسأل"]
};

// ☎️ Emergency numbers keywords
const emergencyKeywords = {
  "999": ["شرطة", "اتصل بالشرطة", "طوارئ الشرطة"],
  "997": ["اسعاف", "اتصل بالاسعاف", "طوارئ طبية"],
  "998": ["حريق", "الدفاع المدني", "اطفاء حريق"],
  "996": ["أمن الطرق", "شرطة المرور"],
  "993": ["حوادث المرور", "حادث"],
  "933": ["كهرباء", "انقطاع الكهرباء"],
  "939": ["ماء", "اتصل بالماء"]
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

  for (const [number, keywords] of Object.entries(emergencyKeywords)) {
    for (const word of keywords) {
      if (lower.includes(word)) {
        return number;
      }
    }
  }

  const numberMatch = lower.match(/اتصل\s*(\d{3})/);
  if (numberMatch) return numberMatch[1];

  return null;
}

// 🚀 start Mueen
function startMueen() {
speak(
  " يمكنك الاختيار بين: " +
  "دعم الاحتياجات الخاصة، " +
  "الاتصال بالطوارئ مثل الشرطة أو الإسعاف أو الدفاع المدني، " +
  "خدمات حكومية مثل تجديد الهوية أو الحصول على رخصة جديدة، " +
  "أو الاستعلامات. " +
  "ماذا تحتاج اليوم؟"
);
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
    const detectedEmergency = detectEmergency(transcript);
    if (detectedEmergency) {
      const callNumber = detectedEmergency;
      const message = `سيتم الآن الاتصال على ${callNumber}.`;

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "ar-SA";
      utterance.onend = () => {
        window.location.href = `emergency.html?call=${callNumber}`;
      };

      speechSynthesis.speak(utterance);
      return;
    }

    const detectedService = detectService(transcript);
    if (detectedService === "support") {
      userData.service = "support";
      localStorage.setItem("service", "support");
      speak("رائع. من فضلك أخبرني ببريدك الإلكتروني.");
      currentStep = "email";
    }
    else if (detectedService) {
      userData.service = detectedService;
      localStorage.setItem("service", detectedService);
      speak("رائع. من فضلك أخبرني ببريدك الإلكتروني.");
      currentStep = "email";
    } else {
      speak("عذرًا، لم أفهم. يمكنك قول: تجديد جواز السفر، تجديد الرخصة، دعم، أو الاتصال بالشرطة.");
    }
  }

  // -------------------
  // 2️⃣ Login
  // -------------------
  else if (currentStep === "email") {
    userData.email = transcript;
    localStorage.setItem("email", transcript);

    speak("شكرًا لك. الآن، من فضلك أخبرني بكلمة المرور.");
    currentStep = "password";
  }

  else if (currentStep === "password") {
    userData.password = transcript;
    localStorage.setItem("password", transcript);

    speak("تم. جاري تسجيل الدخول الآن.");

    if (userData.service === "support") {
      window.location.href = "support.html";
    } else if (userData.service === "inquiries") {   
      window.location.href = "inquiries.html";
    } else {
      window.location.href = "services.html";
    }
  }

  // -------------------
  // 3️⃣ Support form
  // -------------------
  else if (currentStep === "fullName") {
    userData.fullName = transcript;
    localStorage.setItem("fullName", transcript);
    document.getElementById("full-name").value = transcript;

    speak("شكرًا لك. الآن، من فضلك أخبرني برقم هويتك الوطنية.");
    currentStep = "nationalId";
  }

  else if (currentStep === "nationalId") {
    userData.nationalId = transcript;
    localStorage.setItem("nationalId", transcript);
    document.getElementById("national-id").value = transcript;

    speak("تم. ما هو رقم هاتفك؟");
    currentStep = "phone";
  }

 else if (currentStep === "phone") {
  userData.phone = transcript;
  localStorage.setItem("phone", transcript);
  document.getElementById("phone").value = transcript;

  currentStep = "disabilityChoice";

  speak(
    "الآن، من فضلك أخبرني بنوع الاحتياج الخاصة بك: حركة، بصري، سمعي، ذهني، أو أخرى.",
    () => recognition.start() // <-- only start listening after TTS ends
  );
}

else if (currentStep === "disabilityChoice") {
    const lower = transcript.toLowerCase();
    const match = disabilityList.find(d => lower.includes(d.label.toLowerCase()));
    if (match) {
      userData.disability = match.value;
      document.getElementById("disability").value = match.value;

      speak("لقد اخترت " + match.label + ". الآن اختر نوع الدعم: مالي، طبي، مرافق، تعليمي، أو تقني.");
      currentStep = "supportChoice";
    } else {
      speak("لم أفهم من فضلك أخبرني بنوع الاحتياجات الخاصة: حركة، بصري، سمعي، ذهني، أو أخرى.");
    }
}

else if (currentStep === "supportChoice") {
    const lower = transcript.toLowerCase();
    const match = supportList.find(s => lower.includes(s.label.toLowerCase()));
    if (match) {
      userData.support = match.value;
      document.getElementById("support").value = match.value;

      speak("لقد اخترت " + match.label + ". هل تريد إرسال الطلب الآن؟");
      currentStep = "confirmSend";
    } else {
      speak("لم أفهم. من فضلك قل نوع الدعم، مثل: مالي، طبي، مرافق، تعليمي، أو تقني.");
    }
}

  else if (currentStep === "confirmSend") {
    if (transcript.toLowerCase().includes("نعم") || transcript.toLowerCase().includes("yes")) {
      document.querySelector(".support-form").submit();
      speak("تم إرسال طلب الدعم الخاص بك. مع السلامة.");
    } else {
      speak("تم إلغاء الطلب.");
    }
  }

  // -------------------
  // 4️⃣ Services form
  // -------------------
  else if (currentStep === "serviceFullName") {
    userData.fullName = transcript;
    localStorage.setItem("fullName", transcript);
    document.getElementById("full-name").value = transcript;

    speak("شكرًا لك. الآن، من فضلك أخبرني برقم هويتك الوطنية.");
    currentStep = "serviceNationalId";
  }

  else if (currentStep === "serviceNationalId") {
    userData.nationalId = transcript;
    localStorage.setItem("nationalId", transcript);
    document.getElementById("national-id").value = transcript;

    speak("تم. ما هو رقم هاتفك؟");
    currentStep = "servicePhone";
  }

  else if (currentStep === "servicePhone") {
    userData.phone = transcript;
    localStorage.setItem("phone", transcript);
    document.getElementById("phone").value = transcript;

    speak("الرجاء اختيار الخدمة التي تريدها.  ١-تجديد جواز السفر ٢-تجديد الرخصه ٣-تجديد الهويه ٤-جواز مفقود ٥-رخصه مفقوده ٦-هويه مفقوده ٧-رخصة جديدة٨-هويه جديده.");
    currentStep = "serviceChoice";
  }

  else if (currentStep === "serviceChoice") {
    const lower = transcript.toLowerCase();

    const serviceOptions = [
      { value: "renew-passport", label: "تجديد جواز السفر" },
      { value: "renew-license", label: "تجديد الرخصة" },
      { value: "renew-id", label: "تجديد الهوية" },
      { value: "lost-passport", label: "جواز مفقود" },
      { value: "lost-license", label: "رخصة مفقودة" },
      { value: "lost-id", label: "هوية مفقودة" },
      { value: "new-license", label: "رخصة جديدة" },
      { value: "new-id", label: "هوية جديدة" }
    ];

    const match = serviceOptions.find(
      s => lower.includes(s.value) || lower.includes(s.label.toLowerCase())
    );

    if (match) {
      userData.service = match.value;
      document.getElementById("service").value = match.value;
      speak(`لقد اخترت ${match.label}. الآن، من فضلك أخبرني بالتاريخ الذي تفضله.`);
      currentStep = "serviceDate";
    } else {
      speak("لم أفهم. من فضلك قل اسم الخدمة مثل: تجديد جواز السفر، تجديد الهوية، هوية مفقودة، أو هوية جديدة.");
    }
  }

  else if (currentStep === "serviceDate") {
    userData.date = transcript;
    localStorage.setItem("date", transcript);
    document.getElementById("date").value = transcript;

    speak("هل تريد إرسال الطلب الآن؟");
    currentStep = "serviceConfirmSend";
  }

  else if (currentStep === "serviceConfirmSend") {
    if (transcript.toLowerCase().includes("نعم") || transcript.toLowerCase().includes("yes")) {
      document.querySelector(".service-form").submit();
      speak("تم إرسال طلب الخدمة الخاص بك. مع السلامة.");
    } else {
      speak("تم إلغاء الطلب.");
    }
  }

  // -------------------
  // 5️⃣ Inquiries form
  // -------------------
  else if (currentStep === "inquiryName") {
    userData.fullName = transcript;
    localStorage.setItem("fullName", transcript);
    document.getElementById("name").value = transcript;

    speak("شكرًا لك. الآن، من فضلك أخبرني ببريدك الإلكتروني.");
    currentStep = "inquiryEmail";
  }

  else if (currentStep === "inquiryEmail") {
    userData.email = transcript;
    localStorage.setItem("email", transcript);
    document.getElementById("email").value = transcript;

    speak("ممتاز. الآن، من فضلك أخبرني برسالتك.");
    currentStep = "inquiryMessage";
  }

  else if (currentStep === "inquiryMessage") {
    userData.message = transcript;
    localStorage.setItem("message", transcript);
    document.getElementById("message").value = transcript;

    speak("هل تريد إرسال هذا الاستفسار الآن؟");
    currentStep = "inquiryConfirmSend";
  }

  else if (currentStep === "inquiryConfirmSend") {
    if (transcript.toLowerCase().includes("نعم") || transcript.toLowerCase().includes("yes")) {
      document.querySelector(".contact-form").submit();
      speak("تم إرسال استفسارك. مع السلامة.");
    } else {
      speak("تم إلغاء الاستفسار.");
    }
  }

};

// 🔄 keep listening
recognition.onend = () => {
  if (currentStep !== "done") recognition.start();
};

// 🔁 start support flow
function startMueenFlow() {
  currentStep = "fullName";
  speak("مرحبًا بك في الدعم. من فضلك أخبرني باسمك الكامل.");
  recognition.start();
}

// 🔁 start services flow
function startMueenServicesFlow() {
  currentStep = "serviceFullName";
  speak("مرحبًا بك في الخدمات. من فضلك أخبرني باسمك الكامل.");
  recognition.start();
}

// 🔁 start inquiries flow
function startMueenInquiriesFlow() {
  currentStep = "inquiryName";
  speak("مرحبًا بك في الاستفسارات. من فضلك أخبرني باسمك الكامل.");
  recognition.start();
}
