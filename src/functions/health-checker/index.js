const axios = require('axios');

exports.handler = async () => {
  const slackWebhookUrl = 'URL_TO_SLACK_WEBHOOK';

  const currentTime = new Date().toLocaleString('es-ES', { timeZone: 'America/Guayaquil' });

  const environments = {
    Produccion: [
      'https://api.domain.com/',
    ],
    Staging: [
      'https://api-staging.domain.com/',
    ],
    Beta: [
      'https://api-beta.domain.com/',
    ],
    Desarrollo: [
      'https://api-dev.domain.com/',
    ],
  };

  const message = `:mega: *Estado de los ambientes* (${currentTime}, _hora local en America/Guayaquil)_:\n\n`;

  const invokePromises = [];

  for (const environment in environments) {
    const urls = environments[environment];
    const environmentResults = [];

    for (const url of urls) {
      const result = (async () => {
        try {
          const response = await axios.get(url);

          return response.status === 200
            ? `:white_check_mark: ${url} - Health check exitoso (código de respuesta: ${response.status})`
            : `:x: ${url} - Health check fallido (código de respuesta: ${response.status})`;
        } catch (error) {
          return `:x: ${url} - Error en el health check: ${error.message}`;
        }
      })();

      environmentResults.push(result);
    }

    invokePromises.push(
      (async () => {
        const environmentMessage = `\n:arrow_right: *${environment}:*\n${(await Promise.all(environmentResults)).join('\n')}\n\n`;
        return environmentMessage;
      })()
    );
  }

  const results = await Promise.all(invokePromises);

  const consolidatedMessage = message + results.join('');

  try {
    await axios.post(slackWebhookUrl, { text: consolidatedMessage });

    return {
      statusCode: 200,
      body: 'Health check completado',
    };
  } catch (error) {
    console.error('Error al enviar el mensaje a Slack:', error.message);

    return {
      statusCode: 500,
      body: 'Error al enviar el mensaje a Slack',
    };
  }
};
