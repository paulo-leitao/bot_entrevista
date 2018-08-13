// **Modulo para tratar mensagens recebidas e mensagens a serem enviadas ao Facebook Graph API**
// TODO implementar modelos de mensagens estruturadas,ex.: buttons, attachments ...

let fb = require('./fbrequests');
let w = require('./wassistant');
let db = require('./db');
let colors = require('colors');

// Variaveis que devem ser especificas por usuario

let sender = null;
let text = null;
let name = null;

// Trata a mensagem antes de enviar ao W. Assistant
exports.postback = function postback(event){
    sender = event.sender.id;
    this.markSeen(sender);
    text = event.postback.payload;
    // Chama a função para armazenar a entrada do usuário no banco de dados
    db.database(sender,event);
    w.callWatson(sender, text);
};
exports.treatMessage = function treatMessage(event){
    sender = event.sender.id;
    this.markSeen(sender);
    text = "";
    console.log(colors.blue('sender: ',sender));
    if (event.message.text && !event.message.quick_replies){
        text = event.message.text;
        // Chama a função que prepara o doc para inserção no banco de dados
        db.database(sender,event);
        w.callWatson(sender, text);
    }
    if (event.message.attachments){
        text = "Attachment recebido";
        // Chama a função que prepara o doc para inserção no banco de dados
        db.database(sender,event);
        w.callWatson(sender, text);
    }
    /*if (event.message.quick_replies){
        payload = event.message.quick_replies.payload;
        text = payload;
        w.callWatson(sender, text);
    }*/
};

// Prepara a mensagem para envio ao facebook
exports.sendMessage = async function sendMessage(sender, text_,context_,intent) {

    // Busca na mensagem que será enviada ao facebook qualquer match de 'user_name'
    var text__ = "";
    var find = /user_name/g;
    var confirm = text_.match(find);
    console.log('match: ',confirm);

    // Se confirmado a presença de 'user_name' na resposta vindo do W. Assistant é feito então a chamada a função
    // getUsername() de modo que o código só continua a ser executado quando é retornada uma resposta e então 'user_name' é substituido no texto
    if (confirm !== null){
        name = await fb.getUsername(sender);
        console.log('name: ',name);
        text__ = text_.replace(find, name);
    }
    if (confirm == null){
        text__ = text_;
    }


    // Se na mensagem houver botão quick_replies, messageData deve ter a seguinte estrutura
    if (context_ !== null){
        stopTimeOut();
        var messageData = {
            messaging_type: 'RESPONSE',
            recipient: {id: sender},
            message:{
                text:text__,//text:text_
                quick_replies: context_
            }};
    }

    // Se na mensagem conter apenas texto, messageData tera a seguinte estrutura
    if (context_ == null){
        stopTimeOut();
        messageData = {
            messaging_type: 'RESPONSE',
            recipient: {id: sender},
            message:{
                text: text__
            }};
    }

    // Essa condição pode ser configurada da seguinte forma para que funcione em qualquer aplicação apenas configurando
    // no W. Assistant uma variável dentro de output.context, ex.:
    // "output":{"context":{"timeout":"off"}}
    //
    // a condição ficaria então:
    //
    // if (!context_.timeout){timeOut(sender)}
    //
    // Fazer essa alteração implicaria em uma revisão completa de todas as caixas de dialogos do W. Assistant que esta sendo utilizado no momento
    if (intent !== 'timeOut' && intent !== 'Agradecimentos'){
        timeOut(sender);
    }

    // Chama a função que prepara o doc para inserção no banco de dados
    db.database(sender,messageData.message.text,name);

    fb.callSendAPI(messageData);
    //this.removeTypingBubble(sender);
};

// Inicia o timer de inatividade do usuário para 5 minutos = 300000 milisegundos
let timer;
function timeOut (sender){
    timer = setTimeout(send,300000);
    function send(){
        var text = "timeOut";
        w.callWatson(sender,text);
    }
}
function stopTimeOut (){
    clearTimeout(timer);
}

// Função que faz exibir a bolha de digitando no Facebook Messenger
exports.viewTypingBubble = function viewTypingBubble(sender) {
    let messageData = {
        recipient: {
            id: sender
        },
        "sender_action": "typing_on"
    };
    fb.callSendAPI(messageData);
};

// Função que faz encerra a exibição da bolha de digitando no Facebook Messenger
exports.removeTypingBubble = function removeTypingBubble(sender) {
    let messageData = {
        recipient: {
            id: sender
        },
        "sender_action": "typing_off"
    };
    fb.callSendAPI(messageData);
};

// Action que mostra ao usuário que o Assistant vizualição a mensagem
exports.markSeen = function markSeen(sender) {
    let messageData = {
        recipient: {
            id: sender
        },
        "sender_action": "mark_seen"
    };
    fb.callSendAPI(messageData);
};