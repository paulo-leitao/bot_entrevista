# SEFA-TSJ

Aplicação utilizada para integração de Assistente Virtual da Secretaria da Fazenda perfil IBM Watson com Facebook Messenger.

## Rodar a aplicação localmente

1. [Instalar Node.js]
1. Clonar a aplicação:
    `$ git clone https://github.com/jbjares/SEFA-TSJ.git`
1. A partir do diretorio da aplicação executar
`$ npm install` para instalar as dependencias da aplicação
1. Executar:
    `$ npm start` para iniciar a aplicação
1. O aplicativo em execução pode ser acessado em <http://localhost:3001>

## Deplorar na IBM Cloud (Bluemix)

1. Instalar [IBM Cloud Developer Tools] executando o seguinte comando:

	- **Mac e Linux:**	
    
        `$ curl -sL https://ibm.biz/idt-installer | bash`
    - **Windows 10:**
		    
		  Nota: Abrir o Windows Power Shell como administrador

        `$ Set-ExecutionPolicy Unrestricted; iex(New-Object Net.WebClient).DownloadString('http://ibm.biz/idt-win-installer')`
1. Fazer login

    `$ bx login -u [usuário] -p [senha] -o [organização] -s [espaço]`
1. Do diretorio da aplicação, executar:

    `$ bx app push [nome-da-aplicação]`

## Integração com Facebook Messenger

1. Configurar webhook da página de acordo com a url da aplicação.
1. Garantir as seguintes assinaturas de eventos da página:
	- **messages, messaging_postbacks, messaging_optins**

[Instalar Node.js]: https://nodejs.org/en/download/
[IBM Cloud Developer Tools]: https://console.bluemix.net/docs/starters/install_cli.html