escena.webp es el render tal cual (1536x1024), solo recomprimido a WebP q86: 2190 -> 204 KB.
Copia del archivo que llego: assets/producto café/Colombia/Colombia-render-2.webp

NO lleva lienzo anadido, y no lo necesita. El render ANTERIOR si: venia encuadrado tan
cerrado que la web lo pintaba al 96% mientras a los otros cuatro los pinta al 81%, y la
bolsa se comia el encuadre. Ese truco ya no hace falta porque este render viene mas
abierto: la bolsa ocupa el 24% del ancho de pantalla a 1920 y el 27% a 1440, dentro del
rango de los otros cuatro (27-32% y 35-42%). Sigue siendo 1536x1024 (aspecto 1.50) contra
los 1672x941 (1.777) de los demas, asi que el zoom no es identico, pero ya no desentona.

GEOMETRIA (roast-experience.js). Esta trazada sobre ESTE render. Si se sustituye el
archivo, hay que rehacerla o los granos caen donde no es. Ya ha pasado dos veces.

  Como se traza:
  - El borde de roca se puede sacar con un detector de escalon desenfoque->textura, pero
    CUIDADO: en este render encuentra una cresta en 0.71 que es un risco DEL FONDO. La
    bolsa apoya en 0.802, casi un 10% mas abajo, sobre una repisa mas cercana. La
    superficie tiene que seguir el plano de apoyo, no la cresta, o los granos se posan
    flotando muy por encima de la bolsa.
  - La huella de la bolsa se lee mejor a mano sobre un recorte ampliado con rejilla de
    0.01 que con deteccion automatica: la etiqueta blanca despista, porque es mas
    estrecha que el cuerpo kraft.

  Valores actuales:
    surface: (0,0.845) (0.10,0.818) (0.20,0.800) (0.30,0.792) (0.40,0.793) (0.50,0.799)
             (0.60,0.802) (0.70,0.803) (0.80,0.800) (0.90,0.796) (1.00,0.800)
    bag:  x0 0.502  x1 0.745  y 0.802
    flat: [0.15, 0.93]   (a la izquierda de 0.15 ya es vegetacion desenfocada, no piedra)
