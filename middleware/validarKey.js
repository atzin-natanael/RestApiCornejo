const validarApiKey = (req, res, next) => {

    const apiKey = req.get('x-api-key');

    if (!apiKey) {
        console.log('API Key requerida');
        return res.status(401).json({
            
            mensaje: 'API Key requerida'
        });
    }

    if (apiKey !== process.env.API_KEY) {
        console.log('API Key inválida');
        return res.status(401).json({
            mensaje: 'API Key inválida'
        });
    }

    next();
};

module.exports = validarApiKey;