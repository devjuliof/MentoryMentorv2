//criar um flash card
//salvar esse flash card para pode buscar
//exibir o flash 
const btnSubmit = document.getElementById('btnenviar');
if (btnSubmit) {
    btnSubmit.addEventListener("click", createFlashCard);
}

var baseFlashCards = []

function createFlashCard() {
    // base flash cards recebe o local storage ou um array
    baseFlashCards = JSON.parse(localStorage.getItem('flashcards')) || []

    var topic = document.getElementById('topic').value
    var front = document.getElementById('front').value 
    var verse = document.getElementById('verse').value

    //cria um novo topico caso nao exista (caso exista essa função não faz nada significante)
    createNewTopic(topic)

    //cria um novo card
    let newCard = {
        front,
        verse
    }

    //adiciona esse novo card ao topico especifico
    addCards(topic, newCard)

    //persiste os dados no local storage
    //seta o array de flash cards no local storage com a chave 'flash card'
    localStorage.setItem('flashcards', JSON.stringify(baseFlashCards))
}

// Função para recuperar os flashcards quando a página estiver totalmente carregada
document.addEventListener('DOMContentLoaded', function() {
    recuperarFlashCard();
});

function recuperarFlashCard() {
    clearSectionMyFlashCards()
    //transforma o json em array para poder ser usado
    let baseFlashCardsDisplay = JSON.parse(localStorage.getItem('flashcards'))

    baseFlashCardsDisplay.forEach(element => {
        var topic = element.topic

        //chama a função display flash cards para exibir os dados no view.html
        displayTopics(topic)
    });
};

function displayTopics(topic) {
    const sectionMyFlashCards = document.getElementById("MyFlashCards")

    const newDiv = document.createElement("div")
    newDiv.setAttribute("class", "bloco-flash-card")
    newDiv.setAttribute("id", topic)
    newDiv.addEventListener("click", event => {
        event.stopPropagation()
        studyMode(topic)
    })
    sectionMyFlashCards.appendChild(newDiv)

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
            removeCard(topic, contadorAtual)
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
    let parent = document.getElementById('MyFlashCards')

    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }

    let baseFlashCards = JSON.parse(localStorage.getItem('flashcards'))

    const topicData = baseFlashCards.find(item => item.topic === topic) //procura o index do topico e coloca na váriavel topicData
    let cards = topicData.cards
 
    let index = 0
    showCards(index)
    function showCards(index) {
        // Suposição de onde o 'parent' está definido
        let parent = document.getElementById('MyFlashCards');
    
        let baseFlashCardsDisplay = JSON.parse(localStorage.getItem('flashcards'));
    
        // Criação da estrutura do card
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
    
        if (index === cards.length) {
            recuperarFlashCard();
            return;
        }
    
        let pergunta = cards[index].front;
        let resposta = cards[index].verse;
    
        h2front.innerText = pergunta;
        h2verse.innerText = resposta;
    
        let btnVerResposta = document.createElement('button');
        btnVerResposta.textContent = "Revelar resposta";
        btnVerResposta.setAttribute('class', 'btn-visualizar');
        parent.appendChild(btnVerResposta);
    
        btnVerResposta.addEventListener('click', () => {
            cardStudy.classList.add('flipped'); // Adiciona a classe 'flipped' ao 'blocao'
            btnVerResposta.remove();
            
            let newBtn = document.createElement('button');
            newBtn.textContent = "Próximo FlashCard";
            newBtn.setAttribute('class', 'btn-proximo');
            parent.appendChild(newBtn);
            
            newBtn.addEventListener('click', () => {
                while (parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }
                index++;
                showCards(index)
            });
        });
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