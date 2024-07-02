//criar um flash card
//salvar esse flash card para pode buscar
//exibir o flash 
const btnSubmit = document.getElementById('btnenviar');
if (btnSubmit) {
    btnSubmit.addEventListener("click", createFlashCard);
}

let baseFlashCards = []

function createFlashCard() {
    // baseFlashCards foi declarado globalmente na linha 9 para garantir que seja acessivel de outras partes do código
    baseFlashCards = JSON.parse(localStorage.getItem('flashcards')) || [];

    let topic = document.getElementById('topic').value || document.getElementById('topicSelect').value;
    let front = document.getElementById('front').value;
    let verse = document.getElementById('verse').value;

    if (!topic || !front || !verse ) {
        localStorage.setItem('alertType', 'error');
        localStorage.setItem('alertMessage', 'Unable to create card');
    } else {
        // cria o tópico caso não exista
        createNewTopic(topic);

        // Cria um novo card
        let newCard = {
            front,
            verse
        };

        // Adiciona os cards ao tópico
        addCards(topic, newCard);

        // Persiste os dados no local storage
        localStorage.setItem('flashcards', JSON.stringify(baseFlashCards));

        // Armazena o alerta no localStorage
        localStorage.setItem('alertType', 'success');
        localStorage.setItem('alertMessage', 'Created card');
    }

    // Recarrega a página para atualizar o datalist
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', function() {
    // Verifica se há alerta para exibir após a recarga da página
    const alertType = localStorage.getItem('alertType');
    const alertMessage = localStorage.getItem('alertMessage');

    if (alertType && alertMessage) {
        showAlert(alertMessage, alertType);
        
        // Limpa os dados de alerta do localStorage após exibir o alerta
        localStorage.removeItem('alertType');
        localStorage.removeItem('alertMessage');
    }
});

function showAlert(message, type) {
    // Cria o elemento alerta
    let alertElement = document.createElement('div');
    alertElement.classList.add('alert');

    // Adiciona a classe de estilo correta com base no tipo (success, error)
    alertElement.classList.add(type === 'success' ? 'alert-success' : 'alert-error');
    
    if (type === 'success') {
        alertElement.innerHTML = `
        <div class="container">
            <div class="alert-icon">
                <span class="material-symbols-outlined">check</span>
            </div>
            <div class="alert-text">${message}</div>
        </div>
    `;
    } else {
        alertElement.innerHTML = `
        <div class="container">
            <div class="alert-icon">
                <span class="material-symbols-outlined">close</span>
            </div>
            <div class="alert-text">${message}</div>
        </div>
    `;
    }


    // Adiciona o alerta ao contêiner na página
    let alertContainer = document.getElementById('create-flash-card');
    let alertContainer2 = document.getElementById('MyFlashCards');
    if (alertContainer) {
        alertContainer.appendChild(alertElement);
    } else {
        alertContainer2.appendChild(alertElement)
    }
    // Mostra o alerta animado
    setTimeout(function() {
        alertElement.classList.add('show');
    }, 100); // Delay pequeno para garantir a animação

    // Remove o alerta após alguns segundos
    setTimeout(function() {
        alertElement.classList.remove('show');

        // Remove o elemento do DOM após a animação de saída
        setTimeout(function() {
            alertContainer.removeChild(alertElement);
        }, 300);
    }, 3000);
}


document.addEventListener('DOMContentLoaded', function() {
    recuperarFlashCard();
});

function recuperarFlashCard() {
    clearSectionMyFlashCards(); 

    // transforma o json em array para poder ser usado
    let baseFlashCardsDisplay = JSON.parse(localStorage.getItem('flashcards'));

    if (!baseFlashCardsDisplay || baseFlashCardsDisplay.length === 0) {
        let parent = document.getElementById('MyFlashCards');
        let newDiv = document.createElement('div');
        newDiv.setAttribute("class", "msg-no-flash-cards");

        let h2 = document.createElement('h2');
        h2.textContent = "oops, it looks like you haven't created any flash cards yet";
        
        let nav = document.createElement('nav');
        nav.innerHTML = `
          <ul>
            <li><a href="index.html">Create Flash Card</a></li>
          </ul>
        `;

        newDiv.appendChild(h2);
        newDiv.appendChild(nav);
        parent.appendChild(newDiv);
    } else {
        baseFlashCardsDisplay.forEach(element => {
            var topic = element.topic;

            // chama a função display flash cards para exibir os dados no view.html
            displayTopics(topic);
        });
    }
}

    // Função responsável por mostrar os tópicos no view cards
function displayTopics(topic) {
    const sectionMyFlashCards = document.getElementById("MyFlashCards");

    const newDiv = document.createElement("div");
    newDiv.setAttribute("class", "bloco-flash-card");
    newDiv.setAttribute("id", topic);
    newDiv.addEventListener("click", event => {
        event.stopPropagation()
        studyMode(topic)
    })
    sectionMyFlashCards.appendChild(newDiv);

    const buttonRemoveDeck = document.createElement('button')
    buttonRemoveDeck.setAttribute("class", "btnicon fas fa-trash")
    buttonRemoveDeck.addEventListener("click", event => {
        event.stopPropagation()
        removeDeck(topic)
    })
    newDiv.appendChild(buttonRemoveDeck)

    const buttonAcessCards = document.createElement("button")
    buttonAcessCards.addEventListener("click", function () { //adiciona para cada botão um eventListener com o arg topic diferente
        displayCardsForTopic(topic)
    });
    newDiv.appendChild(buttonAcessCards)
    buttonAcessCards.setAttribute("class", "btnicon fas fa-folder")

    const buttonEditCards = document.createElement("button")
    buttonEditCards.setAttribute("class", "btnicon fas fa-pen")
    buttonEditCards.addEventListener("click", event => {
        event.stopPropagation()
        buttonEditCardsClicked(topic)
    })
    newDiv.appendChild(buttonEditCards)
    
    const h2topic = document.createElement("h2")
    h2topic.textContent = (topic)
    newDiv.appendChild(h2topic)
    }


    // Função que mostra os cards por tópico na hora de editar
function displayCardsForTopic(topic) {
    let parent = document.getElementById('MyFlashCards')

    // Enquanto tiver filhos da Section com id MyFlashCards esse laço removerá
    clearSectionMyFlashCards()

    const baseFlashCards = JSON.parse(localStorage.getItem('flashcards'))
    const topicData = baseFlashCards.find(item => item.topic === topic) //procura o index do topico e coloca na váriavel topicData

    // Função para ajustar a altura do textarea conforme o conteúdo
    function adjustHeight(element) {
        element.style.height = 'auto';
        element.style.height = (element.scrollHeight) + 'px';
    }

    var contador = 0
    // Nesse forEach cada textarea recebe um id, as perguntas recebem ids
    //pares e as respostas ids impares, para conseguir fazer a substituição quando editar
    topicData.cards.forEach((card) => {
        let newDiv = document.createElement("div");
        newDiv.setAttribute("class", "div-editar-flashcard");

        // Criando textarea para a pergunta
        let inputPergunta = document.createElement("textarea");
        inputPergunta.setAttribute('id', contador)

        // Adicionando uma IIFE para coletar o valor do input quando
        //o usuario "desfoca" do input
        const buttonRemoveCard = document.createElement('button')
        buttonRemoveCard.setAttribute("class", "btnicon fas fa-trash trash-editcards")
        buttonRemoveCard.addEventListener("click", (function(contadorAtual) {
            return () => {
            clearSectionMyFlashCards()
            //criando modal
            let newDiv = document.createElement('div')
            newDiv.setAttribute('class', 'modal-confirm')
        
            // h2 cuidado
            let h2 = document.createElement('h2')
            h2.textContent = "Caution"
            newDiv.appendChild(h2)

            let p = document.createElement('p')
            p.textContent = ('Removed Decks cannot be recovered. Are you sure you want to remove it?')
            newDiv.appendChild(p)

            let divButons = document.createElement('div')
            divButons.setAttribute('class', 'btns-modal')
            let btnCancel = document.createElement('button')
            let btnConfirm = document.createElement('button')
            btnCancel.setAttribute('class', 'btn-cancel')
            btnCancel.textContent = 'CANCEL'
            btnConfirm.setAttribute('class', 'btn-confirm')
            btnConfirm.textContent = 'Yes, remove deck'
            divButons.appendChild(btnCancel)
            divButons.appendChild(btnConfirm)
            newDiv.appendChild(divButons)
            let parent = document.getElementById('MyFlashCards')
            parent.appendChild(newDiv)
            btnCancel.addEventListener('click', function() {
                clearSectionMyFlashCards()
                displayCardsForTopic(topic)
            })

            btnConfirm.addEventListener('click', function() {
                removeCard(topic, contadorAtual)
            })
            }
        })(contador));

        inputPergunta.addEventListener("blur", (function(contadorAtual) {
            return () => {
            let valorInput = document.getElementById(contadorAtual).value
            editCards(valorInput, topic, contadorAtual)
            };
        })(contador))
        inputPergunta.setAttribute("class", "input-editar");
        inputPergunta.value = card.front;
        newDiv.appendChild(inputPergunta);

        // Adicionando evento de entrada para ajustar a altura dinamicamente
        inputPergunta.addEventListener('input', function() {
            adjustHeight(inputPergunta);
        });

        contador++

        // Criando textarea para a resposta
        let inputResposta = document.createElement("textarea");
        inputResposta.setAttribute('id', contador)
        inputResposta.addEventListener("blur", (function(contadorAtual) {
            return () => {
            let valorInput = document.getElementById(contadorAtual).value
            editCards(valorInput, topic, contadorAtual)
            }
        })(contador));
        inputResposta.setAttribute("class", "input-editar");
        inputResposta.value = card.verse;
        newDiv.appendChild(inputResposta);

        // Adicionando evento de entrada para ajustar a altura dinamicamente
        inputResposta.addEventListener('input', function() {
            adjustHeight(inputResposta);
        });

        newDiv.appendChild(buttonRemoveCard)

        contador++

        parent.appendChild(newDiv);
    });
    let btnAdd = document.createElement('button')
    btnAdd.setAttribute('class', 'btn-add-edit fas fa-plus')
    parent.appendChild(btnAdd)

    btnAdd.addEventListener("click", function() {
        let baseFlashCards = JSON.parse(localStorage.getItem('flashcards'));
        const topicData = baseFlashCards.find(item => item.topic === topic);

        let newCard = {
            front: '',
            verse: ''
        }

        topicData.cards.push(newCard)

        localStorage.setItem('flashcards', JSON.stringify(baseFlashCards))
        displayCardsForTopic(topic)
    })
};

//função que cria novo topico
//ela usa o metodo some para testar se o topico ja existe
//caso nao exista ele cria o topico e adiciona a chave dos cards
//e tambem adiciona um id caso o topico ainda nao tenha sido criado
function createNewTopic(topic) {

    let topicAlredyExist = baseFlashCards.some(item => item.topic === topic)
    if (!topicAlredyExist) {
        let newTopic = {
            topic,
            cards: []
        }

        baseFlashCards.push(newTopic)
    }
}

//função que adiciona cards no topic
//itera sobre o array para achar o indice do topico e
//após encontrar o indice do topic adiciona os cards
//nos cards desse indice
function addCards(topic, newCard) {
    for (let i = 0; i < baseFlashCards.length; i++) {
        if (baseFlashCards[i].topic === topic) {
            baseFlashCards[i].cards.push(newCard)
            break;
        }
    }
}

function studyMode(topic) {
    let parent = document.getElementById('MyFlashCards');
    clearSectionMyFlashCards()

    let baseFlashCards = JSON.parse(localStorage.getItem('flashcards'));

    const topicData = baseFlashCards.find(item => item.topic === topic); // Procura o index do tópico e coloca na variável topicData
    let cards = topicData.cards;

    let index = 0;
    let indexValue = 9;

    showCards(index);

    function showCards(index) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        
        if (index > indexValue || index === cards.length) {
            let newDiv = document.createElement('div');
            newDiv.setAttribute('class', 'div-mais-cards');
            let h2 = document.createElement('h2');
            h2.textContent = "Congratulations, you studied 10 flash cards!";
            let sair = document.createElement('button');
            sair.setAttribute('class', 'mais-cards-btn-sair');
            sair.textContent = "Back";
            let mais10 = document.createElement('button');
            mais10.setAttribute('class', 'mais-cards-btn-mais');
            mais10.textContent = "Study more 10";

            parent.appendChild(newDiv);
            newDiv.append(h2, sair, mais10);

            sair.addEventListener('click', function() {
                clearSectionMyFlashCards();
                recuperarFlashCard();
            });

            mais10.addEventListener('click', function() {
                if (index === cards.length) {
                    index = 0;
                    indexValue = 9;
                } else {
                    index = indexValue + 1;
                    indexValue += 10;
                }
                showCards(index);
            });
        } else {
            let cardStudy = document.createElement('div');
            cardStudy.setAttribute('class', 'blocao');

            let cardInner = document.createElement('div');
            cardInner.setAttribute('class', 'card-inner');

            let frente = document.createElement('div');
            frente.setAttribute('class', 'frente');

            let h2front = document.createElement('h2');
            frente.appendChild(h2front);

            let verso = document.createElement('div');
            verso.setAttribute('class', 'verso');

            let h2verse = document.createElement('h2');
            verso.appendChild(h2verse);

            cardInner.appendChild(frente);
            cardInner.appendChild(verso);
            cardStudy.appendChild(cardInner);
            parent.appendChild(cardStudy);

            let pergunta = cards[index].front;
            let resposta = cards[index].verse;

            h2front.innerText = pergunta;
            h2verse.innerText = resposta;

            if (h2verse.textContent.length < 53) {
                h2verse.style.display = 'flex'
                h2verse.style.alignItems = 'center'
                h2verse.style.justifyContent = 'center'

            }

            let btnVerResposta = document.createElement('button');
            btnVerResposta.textContent = "Reveal answer";
            btnVerResposta.setAttribute('class', 'btn-visualizar');
            parent.appendChild(btnVerResposta);

            btnVerResposta.addEventListener('click', () => {
                cardStudy.classList.add('flipped');
                btnVerResposta.remove();

                let newBtn = document.createElement('button');
                newBtn.textContent = "Next Card";
                newBtn.setAttribute('class', 'btn-proximo');
                parent.appendChild(newBtn);

                newBtn.addEventListener('click', () => {
                    index++;
                    showCards(index);
                });
            });
        }
    }
}


    function buttonEditCardsClicked(topic){
        clearSectionMyFlashCards()

        //chamando a função para mostrar os cards com o argumento topic
        displayCardsForTopic(topic)
    }

    function clearSectionMyFlashCards() {
        let parent = document.getElementById('MyFlashCards')

        while (parent.firstChild) {
            parent.removeChild(parent.firstChild)
        }
    }

    // Substitui o front ou verse do flash card e coloca no localStorage novamente
    function editCards(valorInput, topic, contadorAtual) {
        let baseFlashCards = JSON.parse(localStorage.getItem('flashcards'))
        // procura o topico e guarda na variavel
        const topicData = baseFlashCards.find(item => item.topic === topic)

        // Divide por dois pois a estrutura do array é
        // cards: [
        //  {front: "pergunta", verse: "resposta"},
        //  {front: "pergunta", verse: "resposta"}
        //  ]
        // e cada pergunta recebe um contador par e cada resposta um contador impar
        // ou seja para cada um indice card, existem dois contadores diferentes (um para a pregunta)
        // e outro para a resposta, sendo assim dentro do cards indice 0, tem o contador 0 e o contador 1
        // dentro do cards indice 1, tem o contador 2 e 3 e assim por diante
        let index = Math.floor(contadorAtual / 2)
        if (0 === contadorAtual % 2) {
            topicData.cards[index].front = valorInput // Substituimos pelo novo valor
        } else if (1 === contadorAtual % 2) {
            topicData.cards[index].verse = valorInput // Substituimos pelo novo valor
        }

        localStorage.setItem('flashcards', JSON.stringify(baseFlashCards))
    }

    // Função que remove o deck da base de dados e do DOM
    function removeDeck(topic) {
        clearSectionMyFlashCards()
        //criando modal
        let newDiv = document.createElement('div')
        newDiv.setAttribute('class', 'modal-confirm')
        
        // h2 cuidado
        let h2 = document.createElement('h2')
        h2.textContent = "Cuidado"
        newDiv.appendChild(h2)

        let p = document.createElement('p')
        p.textContent = ('Removed Decks cannot be recovered. Are you sure you want to remove it?')
        newDiv.appendChild(p)

        let divButons = document.createElement('div')
        divButons.setAttribute('class', 'btns-modal')
        let btnCancel = document.createElement('button')
        let btnConfirm = document.createElement('button')
        btnCancel.setAttribute('class', 'btn-cancel')
        btnCancel.textContent = 'CANCEL'
        btnConfirm.setAttribute('class', 'btn-confirm')
        btnConfirm.textContent = 'Yes, remove deck'
        divButons.appendChild(btnCancel)
        divButons.appendChild(btnConfirm)
        newDiv.appendChild(divButons)
        let parent = document.getElementById('MyFlashCards')
        parent.appendChild(newDiv)

        btnCancel.addEventListener('click', function() {
            clearSectionMyFlashCards()
            recuperarFlashCard()
        })

        btnConfirm.addEventListener('click', function() {

            recuperarFlashCard()

            let baseFlashCards = JSON.parse(localStorage.getItem('flashcards'))

            //acha o topico e coloca ele e seus cards na variavel topicData
            const topicData = baseFlashCards.findIndex(item => item.topic === topic)
    
            // Apaga apenas o topico encontrado e devolve ao array
            baseFlashCards.splice(topicData, 1)
            localStorage.setItem('flashcards', JSON.stringify(baseFlashCards))
            
            // Retorna o feedback visual na página
            let divRemovida = document.getElementById(topic)
            let parent = document.getElementById('MyFlashCards')
            parent.removeChild(divRemovida)

            recuperarFlashCard()
            })
        }
        
    function removeCard(topic, contadorAtual) {
        let baseFlashCards = JSON.parse(localStorage.getItem('flashcards'))

        const topicData = baseFlashCards.find(item => item.topic === topic)

        // o contador é multiplicado por 2, ou seja o 0 recebe 0, mas o 1 vira 2
        // o 2 vira 4 o 2 vira 6, e assim por diante, então é necessário dividir por dois
        let indexRemoveCard = contadorAtual / 2

        topicData.cards.splice(indexRemoveCard, 1)

        localStorage.setItem('flashcards', JSON.stringify(baseFlashCards))

        clearSectionMyFlashCards()
        displayCardsForTopic(topic)
    }

// Função para preencher o select com os tópicos do localStorage
function populateTopicsSelect() {
    const select = document.getElementById('topicSelect');
    
    // Simulando o localStorage com baseFlashCards
    const baseFlashCards = JSON.parse(localStorage.getItem('flashcards'));
    
    baseFlashCards.forEach(topicObj => {
      const option = document.createElement('option');
      option.value = topicObj.topic;
      option.textContent = topicObj.topic;
      select.appendChild(option);
    }); 
  }
  
  // Chama a função para preencher o select ao carregar a página
  populateTopicsSelect();
  
// Event listener para alternar entre input e select conforme necessário
const topicInput = document.getElementById('topic');
const topicSelect = document.getElementById('topicSelect');
const defaultOptionText = 'Select a topic'; // texto da opção padrão

topicInput.addEventListener('input', function() {
  toggleTopicInput('input'); // Mostra o campo de input ao digitar
});

topicSelect.addEventListener('change', function() {
  if (topicSelect.options[topicSelect.selectedIndex].text === defaultOptionText) {
    toggleTopicInput('fora'); // Chama a função se a opção selecionada for a padrão
  } else {
    toggleTopicInput('select'); // Esconde o campo de input quando uma opção do select é selecionada
  }
});

// Função para alternar entre input e select
function toggleTopicInput(param) {
  switch (param) {
    case 'input':
      topicInput.style.display = 'inline';
      topicSelect.style.display = 'none';
      break;
    case 'select':
      topicInput.style.display = 'none';
      topicSelect.style.display = 'inline';
      break;
    case 'fora':
      topicInput.style.display = 'inline';
      topicSelect.style.display = 'inline';
      topicInput.value = ''; // Apaga o conteúdo do input
      topicSelect.selectedIndex = 0; // Reseta o select para o valor padrão (primeira opção)
      break;
  }
}

document.addEventListener('click', function(event) {
  var elemento1 = document.getElementById('front');
  var elemento2 = document.getElementById('verse'); 
  var elemento3 = document.getElementById('topic'); 
  var elemento4 = document.getElementById('topicSelect');

  // Verifica se o clique foi fora dos elementos
  if (!elemento1.contains(event.target) && !elemento2.contains(event.target)
      && !elemento3.contains(event.target) && !elemento4.contains(event.target)) {
    toggleTopicInput('fora');
    console.log('Clique fora dos elementos detectado!');
  }
});