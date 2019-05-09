'use strict'
/** LOG4JS - Browser log management. 
 *
 * @license MIT
 * @author Damien Cuvillier <damien@gotan.io>
 * @see https://github.com/GotanKit/log4js#readme
 */
class Log4JS {
	/** Create a new logger. 
	 * @param specificConfiguration (opt) : all settings. 
	 * @param loggerName (opt) : logger name. 
	 * 		it allow to have different configuration for distinct logging purpose. 
	 *		When not set, put instance to "default" value
	 */
	constructor(specificConfiguration, loggerName) {
		try {
			if (__log4jsInstances == null) {
				__log4jsInstances = new Array();
			}
			/* During building logging instance, put this instance, in '___LAUNCHING_INSTANCE___' global variable
			 * Usefull for error handling & file logging */
			__log4jsInstances[Log4JS.LAUNCHING_INSTANCE_IDENTIFIER] = this;

			/** Setup config. */
			this.LEVELS = Log4JS.LEVELS;

			this._loadDefaultConfig();

			if (typeof specificConfiguration == "object") {
				this._loadConfig(specificConfiguration);
			}

			if (loggerName == null) {
				loggerName = "default";
			}
			if (!this.CONFIG.LIVE && this.CONFIG.FILE == null) {
				throw `Log4JS ${loggerName} is useless : you must set either a filename, or set live parameter to true`;
			}

			if (this.CONFIG.DEBUG) {
				this.trace("LOG4JS instanciated");
				if (typeof moment == "undefined") {
					this.warn("MomentJS is not available. Dates will be not displayed in right format");
				}
			}
			// Manage local filesystem File LOGGING
			if (this._isFileFeatureActive()) {
				this.trace("Init filesystem logging")
				this._outfile = new debugout();

				this._outfile.realTimeLoggingOn = false; // Avoid console.log message (duplicated log4js behavior)
				this._outfile.useTimestamps = false;// Avoid timestamp in log message (duplicated log4js behavior)
				this._outfile.recordLogs = true;
				this._outfile.maxLines = 2500;
				this._outfile.autoTrim = true; // FIFO
				this._outfile.tailNumLines = 100;
				this._outfile.logFilename = this.CONFIG.FILE;


				if (this.CONFIG.DEBUG) {
					this.debug(`Started debugout file storing`);
				}
			}

			/** Log4JS Instances management. 
			 * Usefull for error handling and get logging in any context.
			 */
			if (__log4jsInstances[loggerName] != null) {
				throw new Exception(`Unable to launch 2 logger with the same name '${loggerName}'`);
			}
			__log4jsInstances[loggerName] = this;
		} finally {
			if (!this._isFileFeatureActive() /* File launching is async && launching instance will be erased after async process */ ) {
				this._removeLaunchingInstance();
			}
		}
	}

	/** Load configuration default values */
	_loadDefaultConfig() {
		this.CONFIG = {
			LEVEL: this.LEVELS.WARN,
			FILE: null, // Do not record all logs
			PRINT: false,
			PREFIX: "",
			DATE_FORMAT: "YYYYMMDD-HHmmss",
			LIVE: false
		};
	}

	/** Load configuration from LOG_CONFIG const. */
	_loadConfig($config) {
		if (typeof LOG_CONFIG.level != "undefined") {
			this.CONFIG.LEVEL = LOG_CONFIG.level;
		}
		if (typeof LOG_CONFIG.file != "undefined") {
			this.CONFIG.FILE = LOG_CONFIG.file;
		}
		if (typeof LOG_CONFIG.prefix != "undefined") {
			this.CONFIG.PREFIX = LOG_CONFIG.prefix;
		}
		if (typeof LOG_CONFIG.date_format != "undefined") {
			this.CONFIG.DATE_FORMAT = LOG_CONFIG.date_format;
		}
		if (typeof LOG_CONFIG.debug != "undefined") {
			this.CONFIG.DEBUG = LOG_CONFIG.debug;
		}
		if (typeof LOG_CONFIG.live != "undefined") {
			this.CONFIG.LIVE = LOG_CONFIG.live;
		}
	}

	/** Add a log message in browser console with a managed log level.
	 * 
	 * @param level log level. see all levels in LEVELS constant.
	 * @param message : text message. (date & level will be added in log message). 
	 * 		if message is an array, all message will be grouped in console. First item will be used as title
	 * @param avoidFormat Avoid message formating. Usefull internaly for grouped messages
	 * 		default: false
	 * @param onlyConsole Avoid file logging. Usefull for avoiding infinite loop when file logging do not work
	 * 		default: false
	 */
	_log(level, message, avoidFormat, onlyConsole) {

		if (onlyConsole == null) {
			onlyConsole = false;
		}
		if (typeof moment != "undefined") {
			var date = moment().format(this.CONFIG.DATE_FORMAT);
		} else {
			var date = (new Date()).toLocaleString();
		}


		var enabled = level >= this.CONFIG.LEVEL;

		if (!enabled) {
			return;
		}

		var levelLabel = Object.keys(this.LEVELS)[level];

		if (typeof message == "object") {
			var title = `${this.CONFIG.PREFIX}${date} [${levelLabel}] ${message[0]}`;
			console.group(title);
			message.shift();
			for (var i = 0; i < message.length; i++) {
				this._log(level, message[i], true,true);
			}
			console.groupEnd()

			if (this._isFileFeatureActive() && !onlyConsole) {
				this._appendLogFile(title + "\n\t" + message.join("\n\t"));
			}
			return;
		}

		if (avoidFormat == null || avoidFormat == false)  {
			message = `${this.CONFIG.PREFIX}${date} [${levelLabel}] ${message}`;
		}
		if (this.CONFIG.LIVE){
			switch (level) {
				case this.LEVELS.FATAL:
					message = console.error("%c" + message, "background: red; color: yellow; font-size: x-large");
					break;
				case this.LEVELS.ERROR:
					console.error("%c" + message, "font-weight:bold");
					break;
				case this.LEVELS.WARN:
					console.warn("%c" + message, "font-weight:bold;");
					break;
				case this.LEVELS.INFO:
					console.info(message);
					break;
				case this.LEVELS.DEBUG:
					console.log(message);
					break;
				case this.LEVELS.TRACE:
					console.log("%c" + message, "font-size: smaller; color:#888");
					break;
			}
		}


		if (this._isFileFeatureActive() && !onlyConsole) {
			this._appendLogFile(message);
		}
	}


	trace(message) {
		this._log(this.LEVELS.TRACE, message);
	}
	debug(message) {
		this._log(this.LEVELS.DEBUG, message);
	}
	info(message) {
		this._log(this.LEVELS.INFO, message);
	}
	warn(message) {
		this._log(this.LEVELS.WARN, message);
	}
	error(message) {
		this._log(this.LEVELS.ERROR, message);
	}
	fatal(message) {
		this._log(this.LEVELS.FATAL, message);
	}

	downloadFile(){
		this._checkDebugout();
		this._outfile.downloadLog();
	}

	search(searchTerm){
		this._checkDebugout();
		return this._outfile.search(searchTerm);
	}

	tail(numLines){
		this._checkDebugout();
		return this._outfile.tail(numLines);
	}

	printLog(){
		this._checkDebugout();
		console.log(this._outfile.getLog());
	}

	clearFile(){
		this._checkDebugout();
		this._outfile.clear();
	}

	_checkDebugout(){
		if(this._outfile == null || !this._outfile instanceof debugout){
			throw "'file' log4js parameter is null. Log storage is disabled. This feature is not available";
		}
	}
	/** Append message at the end of log file 
	 * @param message string to add
	 */
	_appendLogFile(message) {
		if (this._outfile instanceof debugout)	{
			this._log(Log4JS.LEVELS.TRACE,`Wrote a message to log file ${this.CONFIG.FILE}`, false, true);
			this._outfile.log(message);
		}
	}
	


	/** Get loggerInstance 
	 *  @param loggerName : get logger from this name. 
	 * 		if null get 'default' logger, or if not available, first one (arbitrary)
	 *  @return Log4JS
	 */
	static getLogInstance(loggerName) {
		if (__log4jsInstances == null) {
			throw "Log4JS is not yet instanciated. No instance found";
		}
		if (typeof __log4jsInstances != "object") {
			throw "Log4JS instances are corrupted";
		}
		if (Object.keys(__log4jsInstances).length == 0) {
			throw "Log4JS instances stock is empty";
		}

		if (loggerName == null) {
			loggerName = __log4jsInstances["default"] != null ? "default" : Object.keys(__log4jsInstances)[0]
		}

		if (!__log4jsInstances[loggerName] instanceof Log4JS) {
			throw new Exception(`Log4JS instance ${loggerName} is corrupted`);
		}

		return __log4jsInstances[loggerName];
	}

	/** Remove if exists launching instance after object creation */
	_removeLaunchingInstance() {
		if (Log4JS.__getLaunchingInstance() != null) {
			var newInstances = new Array();
			var keys = Object.keys(__log4jsInstances);
			for (var i = 0; i < keys.length; i++) {
				if (keys[i] != Log4JS.LAUNCHING_INSTANCE_IDENTIFIER) {
					newInstances[keys[i]] = __log4jsInstances[keys[i]];
				}
			};
			__log4jsInstances = newInstances;

		}
	}
	static __getLaunchingInstance() {
		if (__log4jsInstances == null || Object.keys(__log4jsInstances).indexOf(Log4JS.LAUNCHING_INSTANCE_IDENTIFIER) == -1) {
			return null;
		}
		return Log4JS.getLogInstance(Log4JS.LAUNCHING_INSTANCE_IDENTIFIER);
	}

	/** If File feature allowed
	 */
	_isFileFeatureActive() {
		return this.CONFIG.FILE != null; 
	}
}

/** @var __log4jsInstances Stores all log4js instances. 
 * it allows to access them in a any context. 
 */
var __log4jsInstances = null;


// Define all levels
Object.defineProperty(Log4JS, "LEVELS", {
	value: {
		TRACE: 0,
		DEBUG: 1,
		INFO: 2,
		WARN: 3,
		ERROR: 4,
		FATAL: 5
	},
	writable: false,
	enumerable: true,
	configurable: false
});
Object.defineProperty(Log4JS, "LAUNCHING_INSTANCE_IDENTIFIER", {
	value: "___LAUNCHING_INSTANCE___",
	writable: false,
	enumerable: false,
	configurable: false
});