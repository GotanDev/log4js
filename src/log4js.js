/** Browser log management. 
 * Allows to manage all logs displayed in browser console. 
 * Permits, if browser is launched with required configuration, to append these log in an external file. 
 * 
 * Inspired by Log4J java library. 
 * 
 * USAGE:
 * 		Simply use log.<method>(message) method.
 * 		
 * 		@param message can be string or array of strings
 * 
 * CONFIGURATION: You can define these constant 
 *		LOG_CONFIG with following values. 
 * 			All are optionnals. Default values are set. 
 * 
 *     		level: minimum allowed log level. all message above this level will be ignored. 
 *	 			Choose among LEVELS const values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL
 *				Default : WARN
 *
 * 			file: External log file to append. 
 *				⚠ Browser must be launched with right settings to allow file writing. 
 *				Only compatible with chromium & firefox
 *				set null for disabling this feature. 
 *				default: null
 *
 * 			prefix: Prefix before all log message (usefull for log distinguishing)
 * 				default: ""
 *
 *			date_format: date format for displaying message. 
 *				see momentJs documentation
 *				if momentJS is not loaded, this parameter is useless
 * 				default: "YMd-Hmi"
 *
 * 			debug: enable Log4JS debug messages
 * 				default: false
 * 
 * DEPENDENCIES:
 * 		momentjs is not required but allows to format date 
 * 
 * 
 * FULL EXAMPLE
 * 
 *		```
 *		const LOG_CONFIG = {
 *			DEBUG: true, 
 *			LEVEL: Log4JS.LEVELS.TRACE, 
 *			FILE: "/var/log/test-log4js.log",
 *			PREFIX: "MyLogger>"
 *		};
 *		var log = new Log4JS();
 *		log.debug("Info message");
 * 		log.info("Grouped messages", "First message", "Second message");
 *		```
 * @since 20190508
 * @author Damien Cuvillier <damien@gotan.io>
 * @license MIT
 */
class Log4JS{
	constructor(){
		this.LEVELS = Log4JS.LEVELS;

		this._loadDefaultConfig();

		if (typeof LOG_CONFIG == "object") {
			this._loadConfig(LOG_CONFIG);
		}

		if (this.CONFIG.DEBUG) {
			this.trace("LOG4JS instanciated");
			if (typeof moment != "undefined"){
				this.debug("MomentJS is not available. Dates will be not displayed in right format");
			}
		}
	}

	/** Load configuration default values */
	_loadDefaultConfig(){
		this.CONFIG = {
			LEVEL: this.LEVELS.WARN,
			FILE: null, 
			PREFIX: "", 
			DATE_FORMAT: "YMD-HMi", 
			DEBUG: false
		};
	}

	/** Load configuration from LOG_CONFIG const. */
	_loadConfig($config){
		if (typeof LOG_CONFIG.level != "undefined") {
			this.CONFIG.LEVEL = LOG_CONFIG.level;
		}
	}
	
	/** Add a log message in browser console with a managed log level.
	 * 
	 * @param $level log level. see all levels in LEVELS constant.
	 * @param $message : text message. (date & level will be added in log message). 
	 * 		if message is an array, all message will be grouped in console.
	 */
	_log(level, message){
		if (typeof moment != "undefined"){
			var date = moment().format(this.CONFIG.DATE_FORMAT);	
		} else {
			var date = (new Date()).toLocaleString();
		}
		
		
		var enabled = level >= this.CONFIG.LEVEL;

		if (!enabled) {
			return;
		}

		if (typeof message == "array") {
			console.group(message[0]);
			shift(message);
			for(var i = 0; i < message.length; i++){
				log(level, message[i]);
			}
			console.groupEnd()
			return;
		}

		message = `${this.CONFIG.PREFIX}${date} [${level}] ${message}`;
		
		switch(level) {
			case this.LEVELS.FATAL:
			case this.LEVELS.ERROR:
				console.error(message);
				break;
			case this.LEVELS.WARN:
				console.warn(message);
				break;
			case  this.LEVELS.INFO:
				console.info(message);
				break;
			case this.LEVELS.DEBUG:
			case this.LEVELS.TRACE:
				console.log(message);
				break;
		}


		if (this.CONFIG.FILE != null) {
			appendTextFile(LOG_FILE, message);
		}
	}
	/** Ecrit sur un fichier en local. */
	_appendTextFile(){
		makeTextFile = function (text) {
		    var data = new Blob([text], {type: 'text/plain'});

		    // If we are replacing a previously generated file we need to
		    // manually revoke the object URL to avoid memory leaks.
		    if (textFile !== null) {
		      window.URL.revokeObjectURL(textFile);
		    }

		    textFile = window.URL.createObjectURL(data);

		    // returns a URL you can use as a href
		    return textFile;
		}
	}

	trace(message){
		this._log(this.LEVELS.TRACE, message);
	}
	debug(message){
		this._log(this.LEVELS.DEBUG, message);
	}
	info(message){
		this._log(this.LEVELS.INFO, message);
	}
	warn(message){
		this._log(this.LEVELS.WARN, message);
	}
	error(message){
		this._log(this.LEVELS.ERROR, message);
	}
	fatal(message){
		this._log(this.LEVELS.FATAL, message);
	}
}

// Define all levels
Object.defineProperty(Log4JS, "LEVELS",{
    value: {
    	TRACE: 1, 
		DEBUG: 2, 
		INFO: 3, 
		WARN: 4, 
		ERROR: 5, 
		FATAL: 6
    },
    writable : false,
    enumerable : true,
    configurable : false
});
