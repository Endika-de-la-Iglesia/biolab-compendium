# Biolab-Compendium

Este es mi proyecto final del curso «PT Full Stack Development with JavaScript, Python, React» de Bottega. 

# **Objetivo y propósito**

Esta página tiene como objetivo servir de repositorio de protocolos de laboratorio. Se pueden consultar los diferentes protocolos clasificados por cuatro categorías, seleccionables desde la homepage. Asimismo, hay barras de búsqueda que permiten obtener todos los protocolos presentes en la base de datos que tengan los términos indicados. Se ha estructurado de tal manera que sea intuitivo el navegar por las diferentes páginas del sitio web.

# **Estructura del sitio web**

La aplicación consta de tres elementos:

1. Front-end: aplicación generada utilizando react. Todos los archivos están en el subdirectorio "client".

2. Back-end: una aplicación usando node.js y los paquetes express (para generar el servidor web) y sequelize para comunicarse con la base de datos relacional del sitio (en el subdirectorio "server"). El back-end se ha generado de manera monolítica debido a las características intrínsecas del diseño. El back-end se basa en gestionar los usuarios registrados y en servir los protocolos almacenados.

3. Base de datos relacional: MySQL que consta de varias tablas para alamacenar los datos relativos a usuarios y protocolos.

# **Funcionalidades**

1. Existen dos tipos de usuarios: usuarios normales y administradores de la página. Los administradores son los únicos que pueden hacer a otro usuario administrador. Las personas no registradas también pueden usar biolab-compendium, aunque solo pueden ver los protocolos publicados y no confidenciales. En caso de haber un protocolo confidencial o borrador, se limita quién puede visualizarlo. 

2. Cualquier persona puede registrarse, se ha generado un sistema de registro que valida la existencia del correo electrónico usado.

3. Los administradores pueden, en la pestaña de explorar, clickar en el símbolo de «más» y acceder a un formulario que permite añadir un protocolo, consistente en: título, objetivo, categoría, texto (con o sin imágenes), imagen de portada, si es confidencial de qué empresa es, una tabla de cálculo de concentraciones de reactivos (en caso de tener cálculos para reacciones en ese protocolo), la capacidad de añadir un vídeo de youtube relevante para el protocolo en cuestión y la opción de marcar el protocolo como borrador o como publicado.

4. Mediante la opción de explorar se puede acceder a todos los protocolos. Si se pulsa en cualquiera de ellos se accede al detalle del protocolo con todo el contenido. Aquellos usuarios que estén registrados podrán marcar los protocolos como favoritos para poder acceder a ellos con más facilidad. Además, pueden imprimirlos en pdf. Aquellos protocolos con reacicones asociadas pueden modificar los cálculos a su gusto para ajustarse a sus necesidades.

5. Los admin del sistema pueden editar el protocolo desde la página de detalle de cada protocolo o desde las listas de explorar/favorito.

6. Los admin pueden eliminar protocolos y usuarios.

7. Todos los usuarios registrados pueden cambiar su nombre de usuario, email y contraseña. También pueden eliminar su cuenta si así lo desean. 
