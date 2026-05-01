// Genera un regex para contraseñas que cumplan con los siguientes criterios:
// - Mínimo 8 caracteres.
// - Máximo 16 caracteres.
// - Debe contener al menos una letra mayúscula.
// - Debe contener al menos una letra minúscula.
// - Debe contener al menos un número.
// - Puede contener caracteres especiales (@ $ ! % * ? &).
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/gm;

module.exports = passwordRegex;