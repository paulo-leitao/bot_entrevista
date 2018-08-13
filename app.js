'use strict';
/*eslint-disable no-param-reassign */

// Importar libs
let express = require('express');
let bodyParser = require('body-parser');
//let w = require('./libs/wassistant');
let msg = require('./libs/message');
let colors = require('colors');
let app = express();

// Define funcoes globais para tratamento do body de mensagens
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Define o metodo utilizado para configurar o webhook do Facebook - Utilizado unicamente no momento de configuracao da pagina do Facebbok
app.get('/webhook/', function (req, res) {
    if (req.query['hub.mode']==='subscribe' && req.query['hub.verify_token'] === 'teste') {
        res.status(200).send(req.query['hub.challenge']);
    }else{
        res.send('Erro de validação no token.');
    }
});

// Define o metodo utilizado para receber e tratar as mensagens vindas do facebook que irao ser enviadas ao Watson Assistant
// Sempre passa por aqui assim que recebe uma mensagem do Facebbok e antes de chamar o W. Assistant
app.post('/webhook/', function (req, res) {

    var data = req.body;

    // Garante que a subscrição seja uma Pagina
    if (data.object == 'page') {
        // Iteração do codigo a cada entrada
        data.entry.forEach(function (pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iteração a cada evento de mensagens
            // Obtem o evento que contem a mensagem e outras informacoes enviadas pelo Facebook
            pageEntry.messaging.forEach(function (event) {

                // Apos receber o evento trata a mensagem classificando por tipo
                if (event.message) {
                    msg.treatMessage(event);
                }else if (event.postback) {
                    msg.postback(event);
                    console.log("Um postback foi recebido",event.postback)
                }else if (event.delivery){
                    //console.log("Recebido confirmação de delivery: ",event.delivery);
                }else {
                    console.log(colors.red("Webhook recebeu 'event' desconhecido: ", event));
                }
                console.log('event: ',JSON.stringify(event));
            });
        });
    }
    res.sendStatus(200);
});

// O workspace_id foi configurado entre as variáveis de integração do Watson Assistant

var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3001);
app.listen(port, host);