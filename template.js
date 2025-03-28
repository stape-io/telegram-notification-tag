const sendHttpRequest = require('sendHttpRequest');
const encodeUriComponent = require('encodeUriComponent');
const getRequestHeader = require('getRequestHeader');
const getContainerVersion = require('getContainerVersion');
const logToConsole = require('logToConsole');
const JSON = require('JSON');

/**********************************************************************************************/

const isLoggingEnabled = determinateIsLoggingEnabled();
const traceId = isLoggingEnabled ? getRequestHeader('trace-id') : undefined;

// Ref: https://core.telegram.org/bots/api

// Support for line breaks.
// GTM adds an extra backslash character to '\n' -> '\\n'. We have to change it back to just '\n'.
const text = data.text.split('\\n').join('\n');

let url = 'https://api.telegram.org/bot' + encodeUriComponent(data.token) + '/sendMessage';
url += '?chat_id=' + encodeUriComponent(data.channel);
url += data.parseMode ? '&parse_mode=' + data.parseMode : '';
url += '&text=' + encodeUriComponent(text);

log({
  Name: 'Telegram Notification',
  Type: 'Request',
  TraceId: traceId,
  EventName: 'notification',
  RequestMethod: 'GET',
  RequestUrl: url
});

sendHttpRequest(
  url,
  (statusCode, headers, body) => {
    log({
      Name: 'Telegram Notification',
      Type: 'Response',
      TraceId: traceId,
      EventName: 'notification',
      ResponseStatusCode: statusCode,
      ResponseHeaders: headers,
      ResponseBody: body
    });

    if (!data.useOptimisticScenario) {
      if (statusCode >= 200 && statusCode < 300) {
        data.gtmOnSuccess();
      } else {
        data.gtmOnFailure();
      }
    }
  },
  { method: 'GET', timeout: 3000 }
);

if (data.useOptimisticScenario) {
  data.gtmOnSuccess();
}

/**********************************************************************************************/
// Helpers

function log(logObject) {
  if (!isLoggingEnabled) return;
  logToConsole(JSON.stringify(logObject));
}

function determinateIsLoggingEnabled() {
  const containerVersion = getContainerVersion();
  const isDebug = !!(
    containerVersion &&
    (containerVersion.debugMode || containerVersion.previewMode)
  );

  if (!data.logType) {
    return isDebug;
  }

  if (data.logType === 'no') {
    return false;
  }

  if (data.logType === 'debug') {
    return isDebug;
  }

  return data.logType === 'always';
}
