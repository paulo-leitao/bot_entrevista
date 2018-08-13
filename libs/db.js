// Modulo para funções de armazenamento de informações no CloudantDB

let Cloudant = require('@cloudant/cloudant');

// Credenciais de acesso ao DB
var username = 'de52e8a8-9965-4d12-ad2c-fb9757f47c68-bluemix'; // Set this to your own account
var password = process.env.cloudant_password || 'cd0fbc0aca25a82847228c83a9b065cf4a9815f59a22b948e0c29db23528a152';

let cloudant = Cloudant({account:username, password:password});

// Variáveisa a serem iniciadas
let senderId = null;
let inicio = null;
let data = null;
let nome = null;
let entry = null;
let dialogo = [];
let _rev = null;
let doc = [];
let i=0;


// Função para armazenar docs
exports.database = async function database(sender,event,name){
    senderId = sender;
    nome = name;

    // Armazena a data da primeira iteração
    if (inicio == null){
        inicio = new Date(Date.now()).toUTCString();
    }
    // Armazena a data a cada iteração, tanto do robo quanto do usuário
        data = new Date(Date.now()).toUTCString();
        // Mensagens vindas do usuario
        if (event.message){
            entry = data +" usuario: "+ event.message.text;
            dialogo[i++]=entry;
        } if (event.postback){
            entry = data +" usuario: "+ event.postback.payload;
            dialogo[i++]=entry;
        } if (typeof event === 'string'){
            entry = data +" robo: "+event;
            dialogo[i++]=entry;
        }

        // A id do documento corresponderá a id do usuário do facebook
        doc = [{_id:senderId,nome:nome, inicioConversa:inicio, fimConversa:data, dialogo:dialogo}];
};

exports.insertData = async function insertData(){
    let db = cloudant.db.use('relatorios');
    // Verifica se á algum doc que corresponda com a id do usuário.
    db.search('Sender', 'BuscaID', {q: 'id:"' + senderId + '"'}, function (er, result) {
        if (er) {
            throw er;
        }
        console.log('Foi encontrado %d doc', result.total_rows);
        for (var i = 0; i < result.rows.length; i++) {
            console.log('Documento: ', result.rows[i].id);
            //text = text + '\n'+result.rows[i].id;
            // O numero 'rev' do documento é capturado para que o documento possa ser atualizado após o armazenamento
            _rev = result.rows[i].fields.rev;
        }
        // No caso de existir um doc para esse usuário então o doc será atualizado, caso contrário será criado um novo doc
        if(_rev !== null){
            doc[0]._rev = _rev;
            //console.log(doc[0]._rev);
        }
        bulk();
    });

    // Função que cria/atualiza doc em batch
    let bulk = function () {
        //console.log('Doc: ', doc);
        db.bulk({docs: doc}, function (err) {
            if (!err) {
                console.log('Dados armazenados');
            } else {
                throw err;
            }
        });
    }
};