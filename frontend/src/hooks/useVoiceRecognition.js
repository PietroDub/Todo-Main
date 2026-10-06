import { useEffect, useRef, useState } from "react";

function interpretarDataVoz(texto) {
  const fala = texto.toLowerCase().trim();
  const hoje = new Date();

  if (fala.includes("hoje")) {
    return hoje.toISOString().split("T")[0];
  }

  if (fala.includes("amanhã") || fala.includes("amanha")) {
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    return depoisAmanha.toISOString().split("T")[0];
  }

  if (fala.includes("depois de amanhã") || fala.includes("depois de amanha")) {
    const depoisAmanha = new Date();
    depoisAmanha.setDate(hoje.getDate() + 2);
    return depoisAmanha.toISOString().split("T")[0];
  }

  const matchDias = fala.match(/daqui a (\d+) dias/);
  if (matchDias) {
    const dias = parseInt(matchDias[1], 10);
    const dataFutura = new Date();
    dataFutura.setDate(hoje.getDate() + dias);
    return dataFutura.toISOString().split["T"][0];
  }

  return "";
}

export function useVoiceRecognition() {
  const [textoOuvido, setTextoOuvido] = useState("");
  const [ouvindo, setOuvindo] = useState(false);
  const [suportado, setSuportado] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Verifica se a api está disponível no navegador
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        // Microfone ficar contínuo
        recognition.continuous = true;
        // Permitir capturar e processar os trechos parciais enquanto o usuário fala
        recognition.interimResults = true;
        // Confimar o idioma
        recognition.lang = "pt-BR";

        // Evento dispara quando o áudio é processado
        // Convertendo em texto
        recognition.onresult = (event) => {
          let transcricaoFinal = "";
          // Acumula todos os trechos da fala confirmados
          // Durante a sessão ativa
          for (let i = event.resultIndex; i < event.result.length; i++) {
            if (event.results[i].isFinal) {
              transcricaoFinal += event.results[i][0].transcript + " ";
            }
          }

          if (transcricaoFinal) setTextoOuvido(transcricaoFinal.trim());
        };

        // Evento erro
        recognition.onerror = (event) => {
          console.error("Erro no reconhecimento de voz:", event.error);
          setOuvindo(false);
        };

        // Fim da fala
        recognition.onend = () => {
          setOuvindo(false);
        };

        recognitionRef.current = recognition;
      }
    } else {
      setSuportado(false);
    }
  }, []);

  // Inicia ou interrompe a gravação (liga/desliga)
  const iniciarEscuta = () => {
    if (!recognitionRef.current) return;

    if (ouvindo) {
      // Se já estiver ouvindo o click manual encerra a gravação
      recognitionRef.current.stop();
      setOuvindo(false);
    } else {
      // Limpa texto e inicia e escuta
      setTextoOuvido("");
      setOuvindo(true);
      recognitionRef.current.start();
    }
  };

  // Função para parar a gravação manualmente
  const pararEscuta = () => {
    if (recognitionRef.current && ouvindo) {
      recognitionRef.current.stop();
      setOuvindo(false);
    }
  };

  // Processar a frase capturada e atualiza o estado correspondente
  // Baseado na palavra-chave
  const processarComandoVoz = (
    fala,
    setTitulo,
    setDescricao,
    setDataLimite,
    usuarios = [],
    handleCheckboxChange,
  ) => {
    // Expressões regulares
    const regexTitulo = /(?:título|titulo)\s+(.+)/i;
    const regexDescricao = /(?:descrição|descricao)\s+(.+)/i;
    const regexData = /(?:data|data limite|prazo)\s+(.+)/i;
    const regexParticipantes =
      /(?:participante|participantes|adicionar|incluir)\s+(.+)/i;

    // Match Participante
    const matchParticipante = fala.match(regexParticipantes);
    if (matchParticipante && matchParticipante[1] && handleCheckboxChange) {
      const nomeFalado = matchParticipante[1].trim().toLowerCase();
      // Buscar na lista de usuários um nome equivalente ao que foi falado
      const usuarioEncontrado = usuarios.find((u) =>
        u.nome.toLowerCase().includes(nomeFalado),
      );
      if (usuarioEncontrado) {
        const id = usuarioEncontrado._id;
        handleCheckboxChange(id);
      } else {
        console.warn("Usuário não encontrado na lista:", nomeFalado);
      }
      return;
    }

    // Comando do Título
    const matchTitulo = fala.match(regexTitulo);
    if (matchTitulo && matchTitulo[1]) {
      setTitulo(matchTitulo[1].trim());
      return;
    }

    // Comando da Descrição
    const matchDescricao = fala.match(regexDescricao);
    if (matchDescricao && matchDescricao[1]) {
      setDescricao(matchDescricao[1].trim());
      return;
    }

    // Comando da Data
    const matchData = fala.match(regexData);
    if (matchData && matchData[1]) {
      const dataFormatada = interpretarDataVoz(matchData[1]);
      if (dataFormatada) {
        setDataLimite(dataFormatada);
      }
      return;
    }

    // Não deu nenhum match
  };

  return {
    textoOuvido,
    setTextoOuvido,
    ouvindo,
    iniciarEscuta,
    pararEscuta,
    processarComandoVoz,
    suportado,
  };
}
