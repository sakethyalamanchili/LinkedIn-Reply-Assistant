let contentScriptLoaded = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "contentScriptLoaded") {
    contentScriptLoaded = true;
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const messageInput = document.getElementById('message');
  const languageSelect = document.getElementById('language');
  const generateButton = document.getElementById('generate');
  const replyDiv = document.getElementById('reply');
  const categorySelect = document.getElementById('category');
  const templateInput = document.getElementById('template');
  const saveTemplateButton = document.getElementById('saveTemplate');

  function localGenerateReply(message, language) {
    const analyzeMessage = (message) => {
      const keywords = {
        job_offer: ['job', 'position', 'opportunity', 'role', 'hiring', 'career', 'excel'],
        networking: ['connect', 'network', 'introduction', 'meetup'],
        inquiry: ['question', 'wondering', 'curious', 'information'],
        collaboration: ['project', 'collaborate', 'partnership', 'work together'],
        education: ['program', 'course', 'university', 'study', 'learn', 'MBA']
      };

      for (const [category, words] of Object.entries(keywords)) {
        if (words.some(word => message.toLowerCase().includes(word))) {
          return category;
        }
      }
      return 'general';
    };

    const generateReply = (message, category, language) => {
        const responses = {
          en: {
            job_offer: "Thank you for reaching out about this opportunity! While I am currently satisfied with my role, I'm always open to hearing about new opportunities that align with my career goals. Could you share more details about the position and what you're looking for in an ideal candidate?",
            networking: "Thank you for your interest in connecting! I'm always open to building meaningful professional relationships. I'd love to explore how we can collaborate or support each other's work. Let me know if you'd like to set up a time to chat further.",
            inquiry: "Thanks for your question! I'm happy to help. Could you clarify what specifically you're curious about? That way, I can provide you with the most relevant information.",
            collaboration: "I appreciate you reaching out with this collaboration opportunity! It sounds interesting, and I'd like to know more about your vision for this project. How do you see us working together, and what would be the main goals?",
            education: "Thank you for sharing this educational opportunity with me. While I'm not currently seeking formal education, I'm always open to learning and developing new skills. Could you provide more details on how this program is structured and what benefits it offers to professionals like me?",
            general: "Thank you for your message! Could you please share a bit more context or specifics regarding your request? I'd be happy to assist or point you in the right direction."
          },
          hi: {
            job_offer: "इस अवसर के बारे में संपर्क करने के लिए धन्यवाद! हालांकि मैं वर्तमान में अपनी भूमिका से संतुष्ट हूं, मैं हमेशा नए अवसरों के बारे में सुनने के लिए तैयार हूं जो मेरे करियर लक्ष्यों के अनुरूप हों। क्या आप इस पद के बारे में और अधिक जानकारी साझा कर सकते हैं और आप एक आदर्श उम्मीदवार में क्या देख रहे हैं?",
            networking: "जुड़ने में आपकी रुचि के लिए धन्यवाद! मैं हमेशा सार्थक पेशेवर संबंध बनाने के लिए तैयार हूं। मुझे यह जानना अच्छा लगेगा कि हम कैसे सहयोग कर सकते हैं या एक-दूसरे के काम का समर्थन कर सकते हैं। यदि आप आगे बातचीत करने का समय निर्धारित करना चाहते हैं तो मुझे बताएं।",
            inquiry: "आपके प्रश्न के लिए धन्यवाद! मैं मदद करने में खुशी होगी। क्या आप स्पष्ट कर सकते हैं कि आप विशेष रूप से किस बारे में जानना चाहते हैं? इस तरह, मैं आपको सबसे प्रासंगिक जानकारी प्रदान कर सकूंगा।",
            collaboration: "इस सहयोग के अवसर के लिए संपर्क करने के लिए धन्यवाद! यह दिलचस्प लगता है, और मैं इस प्रोजेक्ट के लिए आपके विजन के बारे में और जानना चाहूंगा। आप हमारे साथ काम करने की कल्पना कैसे करते हैं, और मुख्य लक्ष्य क्या होंगे?",
            education: "मेरे साथ इस शैक्षिक अवसर को साझा करने के लिए धन्यवाद। हालांकि मैं वर्तमान में औपचारिक शिक्षा की तलाश नहीं कर रहा हूं, मैं हमेशा नए कौशल सीखने और विकसित करने के लिए तैयार हूं। क्या आप इस कार्यक्रम की संरचना और मेरे जैसे पेशेवरों को यह क्या लाभ प्रदान करता है, इस बारे में अधिक जानकारी दे सकते हैं?",
            general: "आपके संदेश के लिए धन्यवाद! क्या आप कृपया अपने अनुरोध के बारे में थोड़ा और संदर्भ या विवरण साझा कर सकते हैं? मैं सहायता करने या आपको सही दिशा में निर्देशित करने में खुशी होगी।"
          },
          de: {
            job_offer: "Vielen Dank, dass Sie sich wegen dieser Gelegenheit gemeldet haben! Obwohl ich derzeit mit meiner Position zufrieden bin, bin ich immer offen dafür, von neuen Möglichkeiten zu hören, die zu meinen Karrierezielen passen. Könnten Sie mehr Details über die Position und die Anforderungen an den idealen Kandidaten teilen?",
            networking: "Vielen Dank für Ihr Interesse an einer Vernetzung! Ich bin immer offen für den Aufbau bedeutungsvoller beruflicher Beziehungen. Ich würde gerne erkunden, wie wir zusammenarbeiten oder uns gegenseitig unterstützen können. Lassen Sie es mich wissen, wenn Sie einen Termin für ein weiteres Gespräch vereinbaren möchten.",
            inquiry: "Danke für Ihre Frage! Ich helfe gerne. Könnten Sie genauer erläutern, worüber Sie speziell mehr erfahren möchten? So kann ich Ihnen die relevantesten Informationen zur Verfügung stellen.",
            collaboration: "Ich freue mich, dass Sie sich wegen dieser Kooperationsmöglichkeit gemeldet haben! Es klingt interessant, und ich würde gerne mehr über Ihre Vision für dieses Projekt erfahren. Wie stellen Sie sich unsere Zusammenarbeit vor, und was wären die Hauptziele?",
            education: "Vielen Dank, dass Sie diese Bildungsmöglichkeit mit mir teilen. Obwohl ich derzeit keine formale Ausbildung anstrebe, bin ich immer offen dafür, neue Fähigkeiten zu erlernen und zu entwickeln. Könnten Sie mehr Details darüber geben, wie dieses Programm strukturiert ist und welche Vorteile es für Fachleute wie mich bietet?",
            general: "Vielen Dank für Ihre Nachricht! Könnten Sie bitte etwas mehr Kontext oder Details zu Ihrer Anfrage teilen? Ich würde Ihnen gerne helfen oder Sie in die richtige Richtung weisen."
          },
          es: {
            job_offer: "¡Gracias por contactarme acerca de esta oportunidad! Aunque actualmente estoy satisfecho con mi puesto, siempre estoy abierto a escuchar nuevas oportunidades que se alineen con mis objetivos profesionales. ¿Podrías compartir más detalles sobre el puesto y qué cualidades están buscando en el candidato ideal?",
            networking: "¡Gracias por tu interés en conectar! Siempre estoy dispuesto a construir relaciones profesionales significativas. Me encantaría explorar cómo podríamos colaborar o apoyarnos mutuamente. Avísame si te gustaría programar un momento para charlar más a fondo.",
            inquiry: "¡Gracias por tu pregunta! Estaré encantado de ayudarte. ¿Podrías aclarar específicamente qué te interesa saber? Así podré proporcionarte la información más relevante.",
            collaboration: "¡Agradezco que te hayas puesto en contacto con esta propuesta de colaboración! Suena interesante, y me gustaría saber más sobre tu visión para este proyecto. ¿Cómo ves nuestra colaboración y cuáles serían los principales objetivos?",
            education: "Gracias por compartir esta oportunidad educativa conmigo. Aunque no estoy buscando continuar con estudios formales en este momento, siempre estoy interesado en aprender y desarrollar nuevas habilidades. ¿Podrías proporcionarme más detalles sobre cómo está estructurado este programa y qué beneficios ofrece para profesionales como yo?",
            general: "¡Gracias por tu mensaje! ¿Podrías compartir un poco más de contexto o detalles específicos sobre tu solicitud? Estaré encantado de ayudarte o dirigirte en la dirección correcta."
          },
          fr: {
            job_offer: "Merci de m'avoir contacté au sujet de cette opportunité ! Bien que je sois actuellement satisfait de mon poste, je suis toujours ouvert à de nouvelles opportunités qui s'alignent avec mes objectifs de carrière. Pourriez-vous partager plus de détails sur le poste et ce que vous recherchez chez un candidat idéal ?",
            networking: "Merci pour votre intérêt à établir une connexion ! Je suis toujours ouvert à construire des relations professionnelles significatives. J'aimerais explorer comment nous pourrions collaborer ou nous soutenir mutuellement dans notre travail. Faites-moi savoir si vous souhaitez fixer un moment pour en discuter davantage.",
            inquiry: "Merci pour votre question ! Je suis heureux de pouvoir vous aider. Pourriez-vous préciser ce qui vous intéresse spécifiquement ? Ainsi, je pourrai vous fournir les informations les plus pertinentes.",
            collaboration: "Je vous remercie de m'avoir contacté pour cette opportunité de collaboration ! Cela semble intéressant, et j'aimerais en savoir plus sur votre vision de ce projet. Comment envisagez-vous notre collaboration, et quels seraient les principaux objectifs ?",
            education: "Merci d'avoir partagé cette opportunité éducative avec moi. Bien que je ne cherche pas actuellement à poursuivre une éducation formelle, je suis toujours ouvert à l'apprentissage et au développement de nouvelles compétences. Pourriez-vous fournir plus de détails sur la structure de ce programme et les avantages qu'il offre aux professionnels comme moi ?",
            general: "Merci pour votre message ! Pourriez-vous s'il vous plaît partager un peu plus de contexte ou de détails concernant votre demande ? Je serais heureux de vous aider ou de vous orienter dans la bonne direction."
          }
        };
  
        return responses[language][category] || responses[language].general;
      };

    const category = analyzeMessage(message);
    return { reply: generateReply(message, category, language), category };
  }

  generateButton.addEventListener('click', function() {
    const message = messageInput.value;
    const language = languageSelect.value;

    if (contentScriptLoaded) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "generateReply", message: message, language: language }, function(response) {
          if (chrome.runtime.lastError) {
            const localResponse = localGenerateReply(message, language);
            replyDiv.textContent = localResponse.reply;
            categorySelect.value = localResponse.category;
          } else if (response && response.reply) {
            replyDiv.textContent = response.reply;
            categorySelect.value = response.category;
          } else {
            replyDiv.textContent = "An unexpected error occurred.";
          }
        });
      });
    } else {
      const localResponse = localGenerateReply(message, language);
      replyDiv.textContent = localResponse.reply;
      categorySelect.value = localResponse.category;
    }
  });

  saveTemplateButton.addEventListener('click', function() {
    const category = categorySelect.value;
    const template = templateInput.value;
    chrome.storage.sync.get('templates', function(data) {
      const templates = data.templates || {};
      templates[category] = template;
      chrome.storage.sync.set({templates: templates}, function() {
        alert('Template saved successfully!');
      });
    });
  });

  // Load saved templates
  chrome.storage.sync.get('templates', function(data) {
    const templates = data.templates || {};
    categorySelect.addEventListener('change', function() {
      templateInput.value = templates[categorySelect.value] || '';
    });
    templateInput.value = templates[categorySelect.value] || '';
  });
});