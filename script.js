//Variables globales que usaremos para el proyecto

var cartones = []; //Un array para los cartones que usemos
var velocidad; //La velocidad de la partida que se le pasará
var jugadores; //El número de jugadores que tendrá la partida
var precioCarton //Se le pasará el precio del cartón según seleccione el jugador
var intervalo //Para el setInterval
var ganadores = 0; //Aqui pondremos el número de ganadores de la partida
var aciertos = []; //Array para los aciertos de cada cartón
var bombo = []; //Array para los números del bombo
var cantados = []; //Array para los números que ya han sido cantados (fuera del bombo)
var numerosCartones = []; //Array que albergará otros array para saber los números de todos los cartones

//Función al pulsar el botón comenzar

$(document).ready(function () {
    $("#btn-iniciar").click(function () {
        comenzar();
    });
});

function comenzar() {
    //Vamos a rescatar los valores del menú lateral con las opciones de la partida
    velocidad = document.getElementById("velocidad").value;
    jugadores = document.getElementById("numJugadores").value;
    precioCarton = document.getElementById("precioCarton").value;

    //Procedemos a llenar el bombo llamando a la funcion que hace lo propio
    llenarBombo();

    //Es momento de crear los cartones para cada jugador
    for (let i = 0; i < jugadores; i++) {
        cartones[i] = crearCarton();
        numerosCartones[i] = leerCarton(cartones[i]);
    }

    //Ahora podemos dibujar el div donde se mostrarán las bolas que van saliendo
    mostrarBolas();

    //Y a su vez ocultar el que aparece por defecto al entrar en la página
    $("#mensaje").css("display", "none");
    $("#opciones").css("display", "none");

    document.getElementById("btn-iniciar").disabled = true;

    //Creamos el cartón para el jugador principal
    dibujarCarton(cartones[0]);

    //Creamos un div nuevo para meter dentro los cartones de los otros jugadores
    var nuevoDiv = document.createElement("div");
    nuevoDiv.setAttribute("id", "cartonesIA");
    nuevoDiv.classList.add("cartonesIA");
    nuevoDiv.classList.add("pre-scrollable");
    $("#panelDerecho").append(nuevoDiv);

    for (let i = 1; i < cartones.length; i++) {
        dibujarCartonesIA(cartones[i]);
    }

    //Llamamos a la función que nos dibuja la guía de bolas que van saliendo
    guia();

    //Y ya podemos iniciar el intervalo para que empiece el juego
    iniciar();
}

function iniciar() {
    intervalo = setInterval(peticionAjax, velocidad);
}

function pararBingo() {
    clearInterval(intervalo);
}

function reiniciar() {
    window.location.reload();
}

function llenarBombo() {
    for (let i = 1; i <= 90; i++) {
        bombo.push(i);
    }
}

function crearCarton() {
    //Vamos a crear un array del cartón donde irán las tres filas con sus columnas

    var carton = [
        [],
        [],
        []
    ];

    //Llenamos dichos arrays con el siguiente bucle, llamando a la función aleatorio() que nos
    //dará los números que necesitamos
    for (let i = 0; i < 9; i++) {
        var columna;

        if (i == 0) {
            columna = aleatorio(10 * i + 1, 10 * (i + 1) - 1, 3);
        } else if (i == 8) {
            columna = aleatorio(10 * i, 10 * (i + 1), 3);
        } else {
            columna = aleatorio(10 * i, 10 * (i + 1) - 1, 3);
        }

        //Con esta funcion ordenamos los números sin tener en cuenta su valor unicode
        columna.sort(function (a, b) {
            return a - b;
        });

        //Aquí vamos metiendo dichos números generados anteriormente dentro de los cartones
        for (let j = 0; j < 3; j++) {
            carton[j][i] = {
                'valor': columna[j],
                'marca': false
            }
        }
    };

    //Con este bucle for, asignamos huecos de forma aleatoria para ocultar algunos números
    for (let i = 0; i < 3; i++) {
        var huecos = aleatorio(0, 8, 4);

        while (huecos.length > 0) {
            carton[i][huecos.shift()].valor = -1;
        }
    }
    return carton;
}


//Esta función crea los números de manera aleatoria para después usarlos en nuestros cartones
function aleatorio(inicio, fin, numero) {
    var numeros = [];

    if (!numero || numero <= 0) {
        return Math.floor(Math.random() * (fin - inicio + 1)) + inicio;
    } else {
        while (numeros.length < numero) {
            var aleatorios = Math.floor(Math.random() * (fin - inicio + 1)) + inicio;
            if (numeros.indexOf(aleatorios) == -1) {
                numeros.push(aleatorios);
            }
        }
        return numeros.sort(function (a, b) {
            return a - b;
        });
    }
}

//Una vez creados los números aleatorios, necesitamos saber cuales son los cartones generados
//asi que usamos esta función para averiguarlo y poder escribirlos después en nuestro programa
function leerCarton(carton) {
    var lista = [];

    for (let i = 0; i < carton.length; i++) {
        for (let j = 0; j < carton[i].length; j++) {
            if (carton[i][j].valor != -1) {
                lista.push(carton[i][j].valor);
            }
        }
    }
    return lista.sort(function (a, b) {
        return a - b;
    });
}

//Simple función para crear el div de la bola
function mostrarBolas() {
    $("#panelDerecho").append("<br><div id='bola'></div>");
    $("#panelDerecho").append("<br>");
}

//Esta función mostrará en pantalla los cartones que hemos generado anteriormente
function dibujarCarton(carton) {
    //Primero creamos una tabla con sus respectivos atributos y clases
    var tabla = document.createElement("table");
    tabla.setAttribute("id", "carton");
    tabla.setAttribute("border", "3");
    tabla.classList.add("carton");

    //Con este bucle, le añadimos a las celdas de la tabla el valor que le corresponda
    for (var i = 0; i < carton.length; i++) {
        var fila = document.createElement("tr");

        for (let j = 0; j < carton[i].length; j++) {
            var celda = document.createElement("td");
            celda.setAttribute("id", i + "/" + j);

            //Si el valor de la celda es -1, se le asignará la clase 'hueco', para sustituir el 
            //número por una imagen
            if (carton[i][j].valor === -1) {
                celda.classList.add('hueco');
            } else {
                //En caso de tener un valor diferente a -1, se le añadirá de forma normal, y 
                //le añadiremos un listener para cuando se le haga click, nos masque la casilla
                celda.innerHTML = carton[i][j].valor;
                celda.addEventListener("click", function () {
                    marcarCasilla(this.id, carton);
                }, false);
            }
            fila.appendChild(celda);
        }
        tabla.appendChild(fila);
    }

    //Después le indicamos donde queremos añadir este elemento tabla
    var posicion = document.getElementById("panelDerecho");
    posicion.appendChild(tabla);

    //Y añadimos unos botones de Bingo y Reiniciar, con sus respectivas funciones
    $("#panelDerecho").append("<br><br><div id='bbingo'><button class='btn btn-default btn-lg'><b>Bingo</b></button></div>");
    $("#bbingo button").click(bingoCantado);
    $("#botonesLaterales").append("<button id='reiniciar' class='btn btn-default btn-lateral'><b>REINICIAR</b></button>");
    $("#reiniciar").click(reiniciar);
}

//Esto en esencia es igual que dibujar el carton principal, pero para los cartones de otros
//jugadores, asi que tiene ciertas diferencias
function dibujarCartonesIA(carton){

    var tabla = document.createElement("table");
    tabla.setAttribute("id", "cartonIA");
    tabla.setAttribute("border", "3");
    tabla.classList.add("cartonIA");
    tabla.classList.add("col-md-6");

    for (var i = 0; i < carton.length; i++) {
        var fila = document.createElement("tr");
        fila.classList.add("f" + i);

        for (let j = 0; j < carton[i].length; j++) {
            var celda = document.createElement("td");

            if (carton[i][j].valor === -1) {
                celda.classList.add('huecoIA');
            } else {
                celda.innerHTML = carton[i][j].valor;
            }
            fila.appendChild(celda);
        }
        tabla.appendChild(fila);
    }

    var posicion = document.getElementById("cartonesIA");
    posicion.appendChild(tabla);
}

//Con esta petición Ajax extraemos el número del bombo, accediendo al archivo php
function peticionAjax() {
    $.ajax({
        type: "POST",
        url: "ajax.php",
        data: { numeros: bombo },
        dataType: "text",
        success: sacarBola,
        error: function () {
            alert("Ha ocurrido un error en la petición AJAX");
        }
    });
}

//Esta función se ejecutará con el intervalo, y hará que se saque una bola del bombo, así como otras
//cosas, como reproducir la voz que canta las bolas, o marcar la guia o los cartones rivales
function sacarBola(indice) {

    //console.log(indice);
    numeroBola = bombo[indice];

    cantados.push(numeroBola);

    if (cantados.length <= 90) {
        bombo.splice(indice, 1);
        audio("audio/" + numeroBola + ".mp3");
        $("#bola").text("" + numeroBola);

        marcarCartonIA(numeroBola);              
        marcarGuia();

        comprobarResto();
    } else {
        //Cuando no queden más bolas en el bombo, se nos indicará con esta ventana modal

        $("#panelDerecho").append("<div id='ventanaModal' class='modal'>" +
                "<div class='contenido-modal'>" +
                "<h2>El bombo está vacío</h2>" +
                "<h3>No quedan más bolas que cantar</h3>" +
                "<button id='cerrarModal' class='btn btn-info'>Aceptar</button>" +
                "</div>"+"</div>");
                pararBingo();
                var cerrar = document.getElementById("cerrarModal");
                $("#ventanaModal").css("display", "block");

                //Y si hacemos click en el botón que se ha creado en dicha ventana modal
                //se reiniciará la aplicación, al no ser posible seguir jugando
                cerrar.addEventListener("click", function (){
                    reiniciar();
                }, false);
    }
}

//Esta función marca la casilla a la que hacemos click en nuestro cartón
function marcarCasilla(id, carton){
    var celda = document.getElementById(id);
    //Anteriormente le dimos a nuestros td un id con esta estructura: 0/0. Así que aquí
    //lo usamos para poder identificar cada celda de forma individual
    var posicion = id.split('/');

    if (carton[posicion[0]][posicion[1].marca]){
        carton[posicion[0]][posicion[1].marca] = false;
        celda.classList.add('marca');
    } else{
        carton[posicion[0]][posicion[1].marca] = true;
        celda.classList.add('marca');
    }
}

//Esta función nos creará la guía de números que van saliendo del bombo
function guia(){
    
    var contador = 1;

    //Creamos la tabla que usaremos para dicha funcionalidad

    var tabla = document.createElement("table");
    tabla.setAttribute("id", "guia");
    tabla.setAttribute("border", "2");
    tabla.setAttribute("class", "guia table table-responsive table-striped");

    //Y mediante este bucle, le asignamos los números, así como un id del mismo valor, para
    //poder modificar el elemento posteriormente
    for (let i = 0; i < 9; i++) {
        var fila = document.createElement("tr");
        
        for (let j = 0; j < 10; j++) {
            var celda = document.createElement("td");
            celda.setAttribute("id", "g" + contador);
            celda.innerHTML = contador;
            contador++;

            fila.appendChild(celda);
        }
        tabla.appendChild(fila);
    }

    var posicion = document.getElementById("botonesLaterales");
    posicion.appendChild(tabla);
}

//Esta función sera llamada cada vez que sale una bola, y marcará en la guía el número que sale
function marcarGuia(){
    //Recogemos el último numero cantado y con el identificador de la guía, le cambiamos la clase
    var ultimoCantado = cantados[cantados.length - 1];
    
    $("#g" + ultimoCantado).addClass("marca");
}

//Como bien indica su nombre, esta función marcará de forma automática las casillas que van
//saliendo en los cartones rivales
function marcarCartonIA(numeroBola){

    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 9; j++) {
            //Primero le añadimos un identificador a cada fila
            var claseFila = ".f" + i;

            //Y por cada td de esa fila, ejecutamos una función, que cambiará la clase 
            //de la celda si el número coincide con la bola
            $(claseFila).find('td').each (function(){

                if ($(this).html() == numeroBola){
                    $(this).addClass("marca");
                }
            });
        }
    }    
}

//Esta función ira leyendo los cartones rivales para ver si están completos o no
function comprobarResto(){
    for (let i = 1; i < jugadores; i++) {
        if(comprobarBingo(i) == true){
            var jugadorGanador = i;
            //En caso afirmativo, se le añadirá un ganador a la variable correspondiente
            ganadores++;

            //Recogemos el premio actual por haber cantado bingo y lo mostramos en 
            //la ventana modal
            var premioAcumulado = calcularPremio();
            if(ganadores == 1){
                $("#panelDerecho").append("<div id='ventanaModal' class='modal'>" +
                "<div class='contenido-modal'>" +
                "<h2>¡No has ganado!</h2>" +
                "<h3>El jugador número " + jugadorGanador + " ha ganado la partida</h3>" +
                "<h3>Su premio es de " + premioAcumulado + "€" +
                "<br>" +
                "<br>" +
                "<button id='cerrarModal' class='btn btn-info'>Aceptar</button>" +
                "</div>"+"</div>");
                pararBingo();

                var cerrar = document.getElementById("cerrarModal");
                $("#ventanaModal").css("display", "block");

                cerrar.addEventListener("click", function (){
                    reiniciar();
                }, false);
            } else{

                //Lo mismo pasará si hay varios ganadores
                var premioAcumulado = calcularPremio();

                $("#ventanaModal").css("display", "none");

                $("#panelDerecho").append("<div id='ventanaModal' class='modal'>" +
                "<div class='contenido-modal'>" +
                "<h2>¡No has ganado y han habido varios ganadores!</h2>" +
                "<h3>Más suerte la próxima vez</h3>" +
                "<h3>El premio para cada uno es de " + premioAcumulado + "€" +
                "<br>" +
                "<br>" +
                "<button id='cerrarModal' class='btn btn-info'>Aceptar</button>" +
                "</div>"+"</div>");
                pararBingo();
                var cerrar = document.getElementById("cerrarModal");
                $("#ventanaModal").css("display", "block");

                cerrar.addEventListener("click", function (){
                    $("#ventanaModal").css("display", "none");
                    reiniciar();
                }, false);
            }
        }
    }
}

//Esta función servirá para comprobar tanto el bingo del jugador principal como el resto de jugadores
function comprobarBingo(indice){
    var numeros = numerosCartones[indice];
    var correcto = false;
    aciertos[indice] = 0;

    for (let i = 0; i < numeros.length; i++) {
        //Por cada acierto en el cartón, se le sumará a la variable aciertos
        if(cantados.indexOf(numeros[i]) != -1){
            aciertos[indice]++;
        }
    }

    //Y si tiene 15, quiere decir que el bingo está completo
    if(aciertos[indice] == 15) {
        correcto = true;
    }

    return correcto;
}

//Si el bingo del jugador principal es correcto, se ejecutará la siguiente función
function bingoCantado(){
    pararBingo();

    //Simplemente mostrará la ventana modal si el bingo es correcto, y se reiniciará al pulsar el botón
    if(comprobarBingo(0) == true) {
        ganadores++;

        var premioAcumulado = calcularPremio();
        $("#panelDerecho").append("<div id='ventanaModal' class='modal'>" +
                "<div class='contenido-modal'>" +
                "<h2>¡Enhorabuena!</h2>" +
                "<h3>Has sido el ganador de la partida</h3>" +
                "<h3>Tu premio es de " + premioAcumulado + "€" +
                "<br>" +
                "<br>" +
                "<button id='cerrarModal' class='btn btn-info'>Jugar de nuevo</button>" +
                "</div>"+"</div>");

        var cerrar = document.getElementById("cerrarModal");
        $("#ventanaModal").css("display", "block");

        cerrar.addEventListener("click", function (){
            $("#ventanaModal").css("display", "none");
            reiniciar();
        }, false);

    } else{
        //En caso de no ser correcto, se le indicará al jugador, y al pulsar el botón, seguirá
        //el juego
        
        $("#panelDerecho").append("<div id='ventanaModal' class='modal'>" +
                "<div class='contenido-modal'>" +
                "<h2>Su bingo no es correcto</h2>" +
                "<h3>Debe seguir jugando para poder ganar</h3>" +
                "<button id='cerrarModal' class='btn btn-info'>Seguir jugando</button>" +
                "</div>"+"</div>");

        var cerrar = document.getElementById("cerrarModal");
        $("#ventanaModal").css("display", "block");

        cerrar.addEventListener("click", function (){
            $("#ventanaModal").css("display", "none");
            iniciar();
        }, false);
    }
}

function calcularPremio(){
    var resultado = (jugadores * precioCarton) / ganadores;
    return resultado * 0.8;
}

function audio(audio){
    var bolaCantada = new Audio(audio);
    bolaCantada.play();
}