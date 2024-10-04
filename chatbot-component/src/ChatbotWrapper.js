import React, { useRef, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Asegúrate de que la ruta de importación sea correcta
import './chatbot-component.js';

const ChatbotWrapper = () => {
  const chatbotRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Generar un ID de sesión único
    setSessionId(uuidv4());

    // Asegurarse de que el componente está definido antes de usarlo
    if (!customElements.get('chatbot-component')) {
      import('./chatbot-component.js');
    }
  }, []);

  useEffect(() => {
    const chatbotElement = chatbotRef.current;

    if (chatbotElement) {
      const handleMessage = async (event) => {
        const message = event.detail;
        console.log('Mensaje enviado:', message);
        
        try {
          const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, session_id: sessionId }),
          });

          if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
          }

          const data = await response.json();
          console.log('Respuesta del servidor:', data);

          // Usar addBotResponse en lugar de addMessage
          chatbotElement.addBotResponse(data.response);
        } catch (error) {
          console.error('Error al enviar mensaje al servidor:', error);
          chatbotElement.addBotResponse('Lo siento, ha ocurrido un error al procesar tu mensaje.');
        }
      };

      chatbotElement.addEventListener('message-sent', handleMessage);

      // Limpieza
      return () => {
        chatbotElement.removeEventListener('message-sent', handleMessage);
      };
    }
  }, [sessionId]);

  return <chatbot-component ref={chatbotRef} />;
};

export default ChatbotWrapper;