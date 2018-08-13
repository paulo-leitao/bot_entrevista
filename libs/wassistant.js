// **Modulo do Watson Assistant**

let watson = require('watson-developer-cloud');
let msg = require('./message');
let db = require('./db');
let colors = require('colors');

// Define as variaveis de integracao com o Watson Assistant
let w_conversation = watson.conversation({
    url: 'https://gateway.watsonplatform.net/conversation/api',
    username: process.env.CONVERSATION_USERNAME || '9038adb5-b39b-4e9c-9c28-6cfb885e59fe',
    password: process.env.CONVERSATION_PASSWORD || 'AOxL2SCRwePZ',
    path: { workspace_id: 'bfdadb6a-2ec5-4093-bf8b-fd5ab06d7dd2'},
    version: 'v1',
    version_date: '2016-07-11'
});

// Objeto onde serão armazenados os contexts de cada conversa
let contextStack = {};

// Função para realizar a chamada ao W. Assistant, tratar o objeto recebido e enviar para a função sendMessage()
exports.callWatson = function callWatson(sender, text) {
    w_conversation.message({
        input:{"text": text},
        context: contextStack[sender]
    },processResponse);
    function processResponse (err, response) {
        console.log('Response: ',JSON.stringify(response));
        /* callback error */
        if (err) {
            console.error(colors.red('Falha ao chamar o Wantson Assistant. Motivo: ',err));
        }
        //msg.viewTypingBubble(sender);

        // Se tiver existe um contexto atual este é exibido no console
        if ( contextStack[sender] ) {
            console.log(colors.green('Contexto atual: ' + JSON.stringify(contextStack[sender])));
        }

        // Armazena o contexto para permitir que uma conversa ocorra
        // Estamos armazenando um contexto por 'sender' para permitir multiplas conversações simultaneas
        contextStack[sender] = response.context;

        if(response !== null && response.output !== null){
            var i = 0;
            while(i < response.output.text.length){
                if(response.output.context!== null && response.output.context !== undefined && response.intents[0]!== null && response.intents[0]!== undefined){
                    console.log("'output.context' e 'intents' vindos do Watson Assistant nao sao nulos ou vazios.");
                    msg.sendMessage(sender, response.output.text[i++], response.output.context, response.intents[0].intent);
                }
                if((response.output.context== null || response.output.context === undefined) && (response.intents[0]!== null && response.intents[0]!== undefined)){
                    console.log("'output.context' nulo e 'intents' nao nulo vindos do Watson Assistant. Retorno do W. Assistant contem apenas texto, resposta simples. ");
                    msg.sendMessage(sender, response.output.text[i++], response.output.context, response.intents[0].intent);
                }
                if(response.intents[0]== null || response.intents[0]=== undefined){
                    console.log(colors.red("'intents' nulo vindo do Watson Assistant. Nenhum retorno sera executado!"));
                    break;
                }

            }
            // Se for detectado uma ação na resposta, tratar.
            if (response.output.action){
                console.log(colors.yellow('Ação detectada: #' + response.output.action));
                let endConversation = false;

                // Se a ação for de encerrar a conversa
                if (response.output.action === 'end_conversation'){
                    endConversation = true;
                    // ao finalizar a conversa as informações são armazenadas no banco de dados
                    db.insertData();
                }

                // Deleta o contexto para essa conversa
                if (endConversation){
                    delete contextStack[sender];
                    console.log(colors.green('Contexto: ' + JSON.stringify(contextStack[sender])));
                }
            }
        }
    }
};