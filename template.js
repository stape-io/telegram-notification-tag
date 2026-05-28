const encodeUriComponent = require('encodeUriComponent');
const sendHttpRequest = require('sendHttpRequest');

/*==============================================================================
==============================================================================*/

// Ref: https://core.telegram.org/bots/api

let url = 'https://api.telegram.org/bot' + encodeUriComponent(data.token) + '/sendMessage';
url += '?chat_id=' + encodeUriComponent(data.channel);
url += data.parseMode ? '&parse_mode=' + data.parseMode : '';
// Support for line breaks.
// GTM adds an extra backslash character to '\n' -> '\\n'. We have to change it back to just '\n'.
const text = data.text.split('\\n').join('\n');
url += '&text=' + encodeUriComponent(text);

sendHttpRequest(
  url,
  (statusCode, headers, body) => {
    if (!data.useOptimisticScenario) {
      return statusCode >= 200 && statusCode < 300 ? data.gtmOnSuccess() : data.gtmOnFailure();
    }
  },
  { method: 'GET' }
);

if (data.useOptimisticScenario) {
  data.gtmOnSuccess();
}
