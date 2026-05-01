// Expresion regular para nombres de usuario: 
// Que empiecen por una letra mayuscula o minuscula, 
// Poder usar _ - . (guion bajo, guion o punto)
// Puede tener numeros
// Minimo 6 caracteres maximo 18
const usernameRegex = /^[A-Za-z][A-Za-z0-9_.-]{5,17}$/;

module.exports = usernameRegex;