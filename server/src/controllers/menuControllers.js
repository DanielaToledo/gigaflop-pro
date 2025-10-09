export const getMenuOptions = (req, res) => {
    try {
        const menuOptions = [
            {name: "Cotizacion", path: "/cotizacion"},
            {name: "Clientes", path: "/clientes"},
            {name: "Catalogo", path: "/catalogo"},
            {name: "Configuracion", path: "/configuracion"}
        ];
        res.status(200).json({menu: menuOptions});


    } catch (error) {
        console.error("Error al obtener el menú:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};
export default { getMenuOptions };      

