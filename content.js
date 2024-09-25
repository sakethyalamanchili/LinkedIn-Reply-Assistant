function analyzeMessage(message) {
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
  }
  
  function generateReply(message, category, language = 'en') {
    const responses = {
      en: {
        job_offer: "Thank you for reaching out about this opportunity! While I am currently satisfied with my role, I'm always open to hearing about new opportunities that align with my career goals. Could you share more details about the position and what you're looking for in an ideal candidate?",
        networking: "Thank you for your interest in connecting! I'm always open to building meaningful professional relationships. I'd love to explore how we can collaborate or support each other's work. Let me know if you'd like to set up a time to chat further.",
        inquiry: "Thanks for your question! I'm happy to help. Could you clarify what specifically you're curious about? That way, I can provide you with the most relevant information.",
        collaboration: "I appreciate you reaching out with this collaboration opportunity! It sounds interesting, and I'd like to know more about your vision for this project. How do you see us working together, and what would be the main goals?",
        education: "Thank you for sharing this educational opportunity with me. While I'm not currently seeking formal education, I'm always open to learning and developing new skills. Could you provide more details on how this program is structured and what benefits it offers to professionals like me?",
        general: "Thank you for your message! Could you please share a bit more context or specifics regarding your request? I'd be happy to assist or point you in the right direction."
      }
      ,
      es: {
        job_offer: "¡Gracias por contactarme acerca de esta oportunidad! Aunque actualmente estoy satisfecho con mi puesto, siempre estoy abierto a escuchar nuevas oportunidades que se alineen con mis objetivos profesionales. ¿Podrías compartir más detalles sobre el puesto y qué cualidades están buscando en el candidato ideal?",
        networking: "¡Gracias por tu interés en conectar! Siempre estoy dispuesto a construir relaciones profesionales significativas. Me encantaría explorar cómo podríamos colaborar o apoyarnos mutuamente. Avísame si te gustaría programar un momento para charlar más a fondo.",
        inquiry: "¡Gracias por tu pregunta! Estaré encantado de ayudarte. ¿Podrías aclarar específicamente qué te interesa saber? Así podré proporcionarte la información más relevante.",
        collaboration: "¡Agradezco que te hayas puesto en contacto con esta propuesta de colaboración! Suena interesante, y me gustaría saber más sobre tu visión para este proyecto. ¿Cómo ves nuestra colaboración y cuáles serían los principales objetivos?",
        education: "Gracias por compartir esta oportunidad educativa conmigo. Aunque no estoy buscando continuar con estudios formales en este momento, siempre estoy interesado en aprender y desarrollar nuevas habilidades. ¿Podrías proporcionarme más detalles sobre cómo está estructurado este programa y qué beneficios ofrece para profesionales como yo?",
        general: "¡Gracias por tu mensaje! ¿Podrías compartir un poco más de contexto o detalles específicos sobre tu solicitud? Estaré encantado de ayudarte o dirigirte en la dirección correcta."
      }
      
    };
  
    return responses[language][category] || responses[language].general;
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generateReply") {
      const category = analyzeMessage(request.message);
      const reply = generateReply(request.message, category, request.language);
      sendResponse({ reply, category });
    }
  });
  
  // Notify that the content script is loaded
  chrome.runtime.sendMessage({action: "contentScriptLoaded"});