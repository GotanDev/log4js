# log4js
Complete logger for JS browser development

## Browser log management. 
Allows to manage all logs displayed in browser console.   

* Permits, if browser is launched with required configuration, to append these log in an external file. 
 
Inspired by Log4J java library. 
 

## USAGE

Simply use ```log.<method>(message)``` method.
 		
*@param message* can be string or array of strings
 

## CONFIGURATION

You can define these constant 

* LOG_CONFIG with following values.  
All are optionnals. Default values are set. 

* ```level```: minimum allowed log level. all message above this level will be ignored.  
Choose among LEVELS const values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL  
default: WARN
* ```file```: External log file to append.  
⚠ Browser must be launched with right settings to allow file writing.  
Only compatible with chromium & firefox.   
Set null for disabling this feature.  
default: null
* ```prefix```: Prefix before all log message (usefull for log distinguishing)  
default: ""
* ```date_format```: date format for displaying message.  
See [momentJs documentation](https://momentjs.com/docs/#/displaying/).  
If *momentJS* is not loaded, this parameter is useless.   
default: "YMd-Hmi"
* debug: enable Log4JS debug messages  
default: false
 
## DEPENDENCIES

* momentjs is not required but allows to format date 
 
 
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