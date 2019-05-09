# log4js
Complete logger for JS browser development

## Browser log management. 
Allows to manage all logs displayed in browser console.   

* Permits, if browser is launched with required configuration, to append these log in an external file. 
 
Inspired by Log4J java library. 
 

## INSTALLATION

```npm install @g0tan/log4js```

## USAGE

Simply use ```log.<method>(message)``` method.
 		
*@param message* can be string or array of strings

> If message is an array, first message will be used as title of following grouped messages

### METHODS

* All log levels : 
	* trace(message)
	* debug(message)
	* info(message)
	* warn(message)
	* error(message)
	* fatal(message)
* downloadFile() : download file (max 2500 lines)
* tail(lineCount): get last logs
* search(term): search for a specific string in logs
* printLog(): show in console the entire stored log
* clearFile(): erase all stored logs

## CONFIGURATION

You can define these constant 

* LOG_CONFIG with following values.  
All are optionnals. Default values are set. 

* ```level```: minimum allowed log level. all message above this level will be ignored.  
Choose among LEVELS const values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL  
default: WARN
* ```file```: Store all logs in a local storage file.   
Allows to print & download all logs  
Set null for disabling this feature.  
Messages in file storage are not formatted  
default: null
*live: Display all messages in console.  
Print messages in browser console.  
default: false   
Note that if file & live are not set, log4js is useless ;-)  
Message will be formatted in console
* ```prefix```: Prefix before all log message (usefull for log distinguishing)  
default: ""
* ```date_format```: date format for displaying message.  
See [momentJs documentation](https://momentjs.com/docs/#/displaying/).  
If *momentJS* is not loaded, this parameter is useless.   
default: "YYMMDD-HHmmss"
* debug: enable Log4JS debug messages  
default: false
 
## DEPENDENCIES

* momentjs is not required but allows to format date 
* [debugout.js](https://github.com/inorganik/debugout.js) for file outputting
 
## FULL EXAMPLE
 
```
const LOG_CONFIG = {
	DEBUG: true, 
	LEVEL: Log4JS.LEVELS.TRACE, 
	FILE: "/var/log/test-log4js.log",
	PREFIX: "MyLogger>"
};
var log = new Log4JS();
log.debug("Info message");
	log.info("Grouped messages", "First message", "Second message");
```