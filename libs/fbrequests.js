// Modulo para chamadas rest ao Facebook Graph API

let request = require('request');
let rp = require('request-promise');
let colors = require('colors');

// Funcao para realizar chamada rest para o facebook retornar o nome do usuario
exports.getUsername = async function getUsername(sender){
    var name = "";
    let options = {
        uri: 'https://graph.facebook.com/v3.0/'+ sender +'?fields=first_name',//v2.6
        qs: {access_token: token},
        headers:{
            'User-Agent':'Request-Promise'
        },
        json: true
    };
    await rp(options)
        .then(function(repos) {
            console.log('Repos: ',repos);
            name = repos.first_name;
        })
        .catch(function(err){
            console.log(colors.red.bold('Error sending message: ', err));
        });
    return name;
};

// Funcao que realiza chamada rest para o facebook enviado a mensagem ao usuário
exports.callSendAPI = function callSendAPI(messageData) {
    request({
        url: 'https://graph.facebook.com/v3.0/me/messages',//v2.6
        qs: { access_token: token },
        method: 'POST',
        json: messageData
    }, function (error, response,body) {
        if (error) {
            console.log(colors.red.bold('Error sending message: ', error));
        } else if (response.body.error) {
            console.log(colors.red.bold('Error: ', response.body.error));
        }
    });
};

// token da pagina do facebook
var token = "EAAV76cSStmwBAEyc1HFhGZCHSVfzRJbaPT9wefcxEelYZCaAeVTHQbRzraz6EOFz1TVZAeSAShJ2q3NbycNJllMWtITVjYMvOgZCOmoTHeBzhPpsvlo3VjaTTXluZBIR2ZBqHSjpg7NUolKAFGHHtpb49Ljf0uaJvOrxrFZCzLZCFOvPzvJ8u9FV";