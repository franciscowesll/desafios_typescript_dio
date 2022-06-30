// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código 
//e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    X- Busca filmes 
//    X- Apresenta uma lista com os resultados pesquisados 
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, 
// mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction

// apiKey:string = '07faec73633e2a92f22c5fa2ca5ebb66';
let apiKeyInput:string ;
let requestToken: string;
let username:string;
let password:string;
let sessionId: string;
let listId:number; //= 7101979 ;
var checkingLogin:boolean = false;
var checkingCreateList:boolean = false;

let loginButton = (<HTMLSelectElement>document.getElementById('login-button'));
let searchButton = (<HTMLSelectElement>document.getElementById('search-button'));
let searchContainer = document.getElementById('search-container');
let otherfunction= document.getElementById('other-function');
let createListFilmes = (<HTMLSelectElement>document.getElementById('create-button'));
let addListFilmes = (<HTMLSelectElement>document.getElementById('add-button'));
let nameList: string;
let descList: string;
let idFilm:number; 


loginButton?.addEventListener('click', async () => {
  checkingLogin = true;
  validateCreateListFilmes();
  await criarRequestToken();
  await logar();
  await criarSessao();
 console.log('sessionId é: '+sessionId)
  
})




createListFilmes?.addEventListener('click', async () => {
  let descList= (<HTMLSelectElement>document.getElementById('descList')).value;
  let nameList= (<HTMLSelectElement>document.getElementById('nameList')).value;
  await criarLista(nameList, descList);

})

addListFilmes?.addEventListener('click', async() => {
  let idFilm = Number((<HTMLSelectElement>document.getElementById('idFilm')).value);
  await adicionarFilmeNaLista(idFilm, listId)
  await adicionarFilme(idFilm)
})






searchButton?.addEventListener('click', async () => {
 
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }
  let query = (<HTMLSelectElement>document.getElementById('search')).value;
  let listaDeFilmes = await procurarFilme(query);
  let ul = document.createElement('ul');
  ul.id = "lista"

  for (const item of listaDeFilmes.results) {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(item.original_title))
    ul.appendChild(li)
  }

  console.log(listaDeFilmes);
  searchContainer?.appendChild(ul);

  
})

function preencherSenha() {
  password = (<HTMLSelectElement>document.getElementById('senha')).value;
  validateLoginButton();
}

function preencherLogin() {
  username =  (<HTMLSelectElement>document.getElementById('login')).value;
  validateLoginButton();
}

function preencherApi() {
  apiKeyInput = (<HTMLSelectElement>document.getElementById('api-key')).value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKeyInput) {
    if(loginButton){
    loginButton.disabled = false;
    }
  } else {
    if (loginButton){
    loginButton.disabled = true;
    }
  }
}

function validateCreateListFilmes(){
  if(checkingLogin === false){
    if(checkingLogin){
      createListFilmes.disabled = true;
    }
  }
  else{
    if (checkingLogin){
      createListFilmes.disabled = false;
    }
  }
} 

function checkListFilmesTrue(){
  if(checkingCreateList === false){
    addListFilmes.disabled = true
  }
  else{
    addListFilmes.disabled = false;
  }
}

class HttpClient {

  static async get({url, method, body}) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function procurarFilme(query:string):Promise<any> {
  query = encodeURI(query)
  console.log(query)
  let result:any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKeyInput}&query=${query}`,
    method: "GET",
    body:{}
  })

  return result
}

async function adicionarFilme(filmeId: number) {
    let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKeyInput}&language=en-US`,
    method: "GET",
    body:{

    }
  })
  console.log(result);
}

async function criarRequestToken () {
  let result:any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKeyInput}`,
    method: "GET",
    body:{

    }
  })
  
  requestToken = result.request_token
  console.log(requestToken)
}


async function logar() {

  let login = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKeyInput}`,
    method: "POST",
    body : {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
  console.log(login)
}

async function criarSessao() {
  let result:any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKeyInput}&request_token=${requestToken}`,
    method: "GET",
    body:{}
  })

  sessionId = result.session_id;
  console.log(sessionId)
  }

async function criarLista(nomeDaLista:string, descricao:string) {
  
  let result:any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKeyInput}&session_id=${sessionId}`,
    method: "POST",
    body: {
      "name": nomeDaLista,
      "description": descricao,
      "language": "pt"
    }
  })
  listId =  result.list_id;
  console.log(sessionId);
  console.log(result)
  console.log()
  
  }

async function adicionarFilmeNaLista(filmeId:number, listaId:number) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKeyInput}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: filmeId
    }
  })
  console.log(result);

}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKeyInput}`,
    method: "GET",
    body:{}
  })
  console.log(result);
  return result
}

/* <div style="display: flex;">
  <div style="display: flex; width: 300px; height: 100px; justify-content: space-between; flex-direction: column;">
      <input id="login" placeholder="Login" onchange="preencherLogin(event)">
      <input id="senha" placeholder="Senha" type="password" onchange="preencherSenha(event)">
      <input id="api-key" placeholder="Api Key" onchange="preencherApi()">
      <button id="login-button" disabled>Login</button>
  </div>
  <div id="search-container" style="margin-left: 20px">
      <input id="search" placeholder="Escreva...">
      <button id="search-button">Pesquisar Filme</button>
  </div>
</div>*/